import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { AuthRepository } from '../repositories/auth.repository.js';
import { LoginDto } from '../dto/login.dto.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { ForgotPasswordDto } from '../dto/forgot-password.dto.js';
import { ResetPasswordDto } from '../dto/reset-password.dto.js';
import { ILoginResponse, IChangePasswordResponse, IForgotPasswordResponse, IResetPasswordResponse, ILogoutResponse } from '@sistema-monitoreo/shared-contracts';
import { MailerService } from '../../../shared/mailer/mailer.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async login(
    dto: LoginDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<ILoginResponse> {
    const now = new Date();

    // ── 1. Buscar usuario ─────────────────────────────────────────────────
    const user = await this.authRepository.findUserByDni(dto.dni);

    if (!user) {
      await this.authRepository.logAuthEvent({
        eventType: 'LOGIN_FAILURE_UNREGISTERED',
        eventDetail: `Intento de inicio de sesión fallido para DNI no registrado: ${dto.dni}`,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // ── 2. Verificar cuenta activa ────────────────────────────────────────
    if (!user.isActive) {
      await this.authRepository.logAuthEvent({
        userId: user.id,
        eventType: 'LOGIN_FAILURE_INACTIVE',
        eventDetail: `Intento de inicio de sesión fallido: cuenta inactiva`,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      throw new ForbiddenException('Cuenta inactiva');
    }

    // ── 3. Verificar bloqueo temporal ─────────────────────────────────────
    if (user.lockedUntil && user.lockedUntil > now) {
      await this.authRepository.logAuthEvent({
        userId: user.id,
        eventType: 'LOGIN_FAILURE_LOCKED',
        eventDetail: `Intento de inicio de sesión rechazado: cuenta bloqueada temporalmente`,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      throw new ForbiddenException({
        message: 'Cuenta bloqueada temporalmente. Intente más tarde.',
        lockedUntil: user.lockedUntil.toISOString(),
        failedAttempts: user.failedLoginAttempts,
        failedLoginAttempts: user.failedLoginAttempts,
        remainingAttempts: 0,
      });
    }

    // ── 4. Validar contraseña ─────────────────────────────────────────────
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      // Si la cuenta tenía un bloqueo expirado, reiniciamos el contador antes de contar el nuevo intento
      if (user.lockedUntil && user.lockedUntil <= now) {
        await this.authRepository.resetFailedAttempts(user.id);
      }

      const updatedAttempts = await this.authRepository.incrementFailedAttempts(user.id, now);
      
      if (updatedAttempts >= 3) {
        const lockUntil = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutos
        await this.authRepository.lockAccount(user.id, lockUntil);
        await this.authRepository.logAuthEvent({
          userId: user.id,
          eventType: 'ACCOUNT_LOCKED',
          eventDetail: 'Cuenta bloqueada temporalmente por 15 minutos por alcanzar 3 intentos fallidos consecutivos',
          ipAddress: meta?.ipAddress,
          userAgent: meta?.userAgent,
        });
        throw new ForbiddenException({
          message: 'Cuenta bloqueada temporalmente. Intente más tarde.',
          lockedUntil: lockUntil.toISOString(),
          failedAttempts: updatedAttempts,
          failedLoginAttempts: updatedAttempts,
          remainingAttempts: 0,
        });
      }

      await this.authRepository.logAuthEvent({
        userId: user.id,
        eventType: 'LOGIN_FAILURE',
        eventDetail: `Intento de inicio de sesión fallido por contraseña incorrecta. Intento número: ${updatedAttempts}`,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      throw new UnauthorizedException({
        message: 'Credenciales inválidas',
        failedAttempts: updatedAttempts,
        failedLoginAttempts: updatedAttempts,
        remainingAttempts: 3 - updatedAttempts,
      });
    }

    // Si el login es exitoso, limpiamos intentos fallidos acumulados o bloqueos expirados
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.authRepository.resetFailedAttempts(user.id);
    }

    // ── 5. Emitir JWT ─────────────────────────────────────────────────────
    const jti = randomUUID();
    const jwtExpiresInSeconds = 8 * 60 * 60; // 8 horas

    const payload = {
      sub: user.id,
      dni: user.persona?.dni ?? '',
      role: user.role?.code ?? '',
      jti,
      firstLogin: user.isFirstLogin,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: jwtExpiresInSeconds,
    });

    // ── 6. Persistir sesión ───────────────────────────────────────────────
    const expiresAt = new Date(now.getTime() + jwtExpiresInSeconds * 1000);

    await this.authRepository.createSession({
      userId: user.id,
      sessionJti: jti,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
      expiresAt,
    });

    // ── 7. Actualizar último login ────────────────────────────────────────
    await this.authRepository.updateLastLogin(user.id, now);

    // ── 8. Registrar Auditoría de Login Exitoso ───────────────────────────
    await this.authRepository.logAuthEvent({
      userId: user.id,
      eventType: 'LOGIN_SUCCESS',
      eventDetail: 'Inicio de sesión exitoso y creación de sesión activa',
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    // ── 9. Construir respuesta ────────────────────────────────────────────
    return {
      accessToken,
      user: {
        id: user.id,
        dni: user.persona?.dni ?? '',
        nombres: `${user.persona?.nombres ?? ''}`,
        apellidos: `${user.persona?.apellidos ?? ''}`,
        role: user.role?.code ?? '',
        firstLogin: user.isFirstLogin,
      },
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<IChangePasswordResponse> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.authRepository.updatePassword(userId, passwordHash);

    await this.authRepository.logAuthEvent({
      userId,
      eventType: 'PASSWORD_CHANGE',
      eventDetail: 'Cambio de contraseña por primer acceso exitoso',
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
    };
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<IForgotPasswordResponse> {
    const user = await this.authRepository.findUserByDniAndEmail(dto.dni, dto.email);

    if (!user || !user.isActive) {
      // Prevención de enumeración de cuentas: misma respuesta genérica exitosa
      await this.authRepository.logAuthEvent({
        eventType: 'PASSWORD_RESET_REQUEST_UNREGISTERED',
        eventDetail: `Solicitud de recuperación para DNI o correo no registrado: DNI=${dto.dni}, Email=${dto.email}`,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      return {
        success: true,
        message: 'Si el DNI y correo corresponden a un usuario activo, recibirá un correo con las instrucciones.',
      };
    }

    const hasActive = await this.authRepository.hasActiveSession(user.id);
    if (hasActive) {
      await this.authRepository.logAuthEvent({
        userId: user.id,
        eventType: 'PASSWORD_RESET_BLOCKED_ACTIVE_SESSION',
        eventDetail: 'Solicitud de recuperación bloqueada: el usuario cuenta con una sesión activa en el sistema',
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      throw new BadRequestException('No se puede generar un enlace de recuperación si existe una sesión activa en el sistema.');
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    
    // Expiración: 1 hora a partir de ahora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
      requestedIp: meta?.ipAddress,
    });

    await this.authRepository.logAuthEvent({
      userId: user.id,
      eventType: 'PASSWORD_RESET_REQUEST',
      eventDetail: 'Solicitud de enlace de recuperación generada con éxito',
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    // Registramos en consola para poder testearlo y consumirlo sin correo real en dev
    console.log(`[DEV ONLY] Enlace de recuperación generado para el DNI ${dto.dni}: token=${token}`);

    await this.mailerService.sendPasswordResetEmail(user.persona?.correo ?? '', user.persona?.dni ?? '', token);

    return {
      success: true,
      message: 'Si el DNI y correo corresponden a un usuario activo, recibirá un correo con las instrucciones.',
    };
  }

  async resetPassword(
    dto: ResetPasswordDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<IResetPasswordResponse> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const resetToken = await this.authRepository.findResetToken(tokenHash);

    if (!resetToken || resetToken.isUsed || resetToken.expiresAt < new Date()) {
      await this.authRepository.logAuthEvent({
        eventType: 'PASSWORD_RESET_FAILURE',
        eventDetail: `Intento de restablecimiento fallido: token inválido, usado o expirado`,
        ipAddress: meta?.ipAddress,
        userAgent: meta?.userAgent,
      });
      throw new BadRequestException('Enlace de recuperación inválido o expirado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.authRepository.useResetToken(resetToken.id, resetToken.userId, passwordHash);

    await this.authRepository.logAuthEvent({
      userId: resetToken.userId,
      eventType: 'PASSWORD_RESET_SUCCESS',
      eventDetail: 'Restablecimiento de contraseña por token exitoso',
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      success: true,
      message: 'Su contraseña ha sido restablecida con éxito.',
    };
  }

  async logout(
    sessionJti: string,
    userId: string,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<ILogoutResponse> {
    await this.authRepository.invalidateSession(sessionJti, 'LOGOUT');

    await this.authRepository.logAuthEvent({
      userId,
      eventType: 'LOGOUT',
      eventDetail: `Cierre de sesión manual para sesión JTI: ${sessionJti}`,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return {
      success: true,
      message: 'Sesión cerrada correctamente',
    };
  }
}
