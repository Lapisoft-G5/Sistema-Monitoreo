import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthSessionService } from './services/auth-session.service.js';
import { AuthTokenService } from './services/auth-token.service.js';
import { AuthPasswordService } from './services/auth-password.service.js';

import { AuthController } from './controllers/auth.controller.js';

import { UserRepository } from './repositories/user.repository.js';
import { PrismaUserRepository } from './repositories/prisma-user.repository.js';
import { SessionRepository } from './repositories/session.repository.js';
import { PrismaSessionRepository } from './repositories/prisma-session.repository.js';
import { PasswordTokenRepository } from './repositories/password-token.repository.js';
import { PrismaPasswordTokenRepository } from './repositories/prisma-password-token.repository.js';
import { AuditRepository } from './repositories/audit.repository.js';
import { PrismaAuditRepository } from './repositories/prisma-audit.repository.js';

import { PrismaModule } from '../../shared/prisma/prisma.module.js';
import { MailerModule } from '../../shared/mailer/mailer.module.js';
import { AuthGuard } from './guards/auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

@Module({
  imports: [
    PrismaModule,
    MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          issuer: 'sistema-monitoreo',
          audience: 'sistema-monitoreo-client',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthSessionService,
    AuthTokenService,
    AuthPasswordService,
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: SessionRepository, useClass: PrismaSessionRepository },
    { provide: PasswordTokenRepository, useClass: PrismaPasswordTokenRepository },
    { provide: AuditRepository, useClass: PrismaAuditRepository },
    AuthGuard,
    RolesGuard,
  ],
  exports: [
    AuthSessionService,
    AuthTokenService,
    AuthPasswordService,
    UserRepository,
    SessionRepository,
    AuthGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class AuthModule {}
