import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { AuthRepository } from '../repositories/auth.repository.js';
import { LoginDto } from '../dto/login.dto.js';
import { ChangePasswordDto } from '../dto/change-password.dto.js';
import { ILoginResponse, IChangePasswordResponse } from '@sistema-monitoreo/shared-contracts';

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
}
