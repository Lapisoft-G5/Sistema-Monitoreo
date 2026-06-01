import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { AuthRepository } from './repositories/auth.repository.js';
import { PrismaAuthRepository } from './repositories/prisma-auth.repository.js';
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
    AuthService,
    {
      provide: AuthRepository,
      useClass: PrismaAuthRepository,
    },
    AuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, AuthRepository, AuthGuard, RolesGuard],
})
export class AuthModule {}
