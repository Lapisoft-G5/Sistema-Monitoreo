import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { AuthRepository } from '../repositories/auth.repository.js';
import { LoginDto } from '../dto/login.dto.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { ForgotPasswordDto } from '../dto/forgot-password.dto.js';
import { ResetPasswordDto } from '../dto/reset-password.dto.js';
import { ILoginResponse, IChangePasswordResponse, IForgotPasswordResponse, IResetPasswordResponse } from '@sistema-monitoreo/shared-contracts';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    dto: LoginDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<ILoginResponse> {
    const now = new Date();

    // ── 1. Buscar usuario ─────────────────────────────────────────────────
    const user = await this.authRepository.findUserByDni(dto.dni);

    if (!user) {
      // No revelamos si el DNI existe o no (seguridad)
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // ── 2. Verificar cuenta activa ────────────────────────────────────────
    if (!user.isActive) {
      throw new ForbiddenException('Cuenta inactiva');
    }

    // ── 3. Verificar bloqueo temporal ─────────────────────────────────────
    if (user.lockedUntil && user.lockedUntil > now) {
      throw new ForbiddenException('Cuenta bloqueada temporalmente. Intente más tarde.');
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
        throw new ForbiddenException('Cuenta bloqueada temporalmente. Intente más tarde.');
      }

      throw new UnauthorizedException('Credenciales inválidas');
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
      dni: user.dni,
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

    // ── 8. Construir respuesta ────────────────────────────────────────────
    return {
      accessToken,
      user: {
        id: user.id,
        dni: user.dni,
        nombres: `${user.firstName}`,
        apellidos: `${user.lastName}`,
        role: user.role?.code ?? '',
        firstLogin: user.isFirstLogin,
      },
    };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<IChangePasswordResponse> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.authRepository.updatePassword(userId, passwordHash);

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
    };
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
    meta?: { ipAddress?: string },
  ): Promise<IForgotPasswordResponse> {
    const user = await this.authRepository.findUserByDniAndEmail(dto.dni, dto.email);

    if (!user || !user.isActive) {
      // Prevención de enumeración de cuentas: misma respuesta genérica exitosa
      return {
        success: true,
        message: 'Si el DNI y correo corresponden a un usuario activo, recibirá un correo con las instrucciones.',
      };
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

    // Registramos en consola para poder testearlo y consumirlo sin correo real en dev
    console.log(`[DEV ONLY] Enlace de recuperación generado para el DNI ${dto.dni}: token=${token}`);

    return {
      success: true,
      message: 'Si el DNI y correo corresponden a un usuario activo, recibirá un correo con las instrucciones.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<IResetPasswordResponse> {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const resetToken = await this.authRepository.findResetToken(tokenHash);

    if (!resetToken || resetToken.isUsed || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Enlace de recuperación inválido o expirado');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.authRepository.useResetToken(resetToken.id, resetToken.userId, passwordHash);

    return {
      success: true,
      message: 'Su contraseña ha sido restablecida con éxito.',
    };
  }
}
