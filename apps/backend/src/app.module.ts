import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './shared/health/health.module.js';
import { PrismaModule } from './shared/prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { TeachersModule } from './modules/teachers/teachers.module.js';
import { InstitutionsModule } from './modules/institutions/institutions.module.js';
import { EspecialistasModule } from './modules/especialistas/especialistas.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env', './apps/backend/.env'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    TeachersModule,
    InstitutionsModule,
    EspecialistasModule,
  ],
})
export class AppModule {}
