import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service.js';
import { AuthRepository } from './repositories/auth.repository.js';
import { PrismaAuthRepository } from './repositories/prisma-auth.repository.js';
import { PrismaModule } from '../../shared/prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [
    AuthService,
    {
      provide: AuthRepository,
      useClass: PrismaAuthRepository,
    },
  ],
  exports: [AuthService, AuthRepository], // export repository if other modules need user lookup
})
export class AuthModule {}
