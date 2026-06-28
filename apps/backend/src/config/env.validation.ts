import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  FRONTEND_URL: string = 'http://localhost:5173';

  @IsString()
  DATABASE_URL: string = 'postgresql://admin:admin@localhost:5432/monitoring?schema=public';

  @IsString()
  JWT_SECRET: string = 'CHANGE_ME_USE_A_LONG_RANDOM_SECRET_AT_LEAST_64_CHARS';

  @IsString()
  JWT_REFRESH_SECRET: string = 'CHANGE_ME_USE_A_LONG_RANDOM_SECRET_AT_LEAST_64_CHARS';

  @IsString()
  JWT_EXPIRES_IN: string = '15m';

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsNumber()
  @Min(4)
  @Max(16)
  BCRYPT_SALT_ROUNDS: number = 12;

  @IsOptional()
  @IsString()
  SMTP_HOST?: string;

  @IsOptional()
  @IsNumber()
  SMTP_PORT?: number = 1025;

  @IsOptional()
  @IsString()
  SMTP_USER?: string;

  @IsOptional()
  @IsString()
  SMTP_PASS?: string;

  @IsOptional()
  @IsString()
  EMAIL_FROM?: string = 'no-reply@ugel-lampa.gob.pe';

  @IsOptional()
  @IsString()
  UPLOADS_BASE_PATH?: string = './uploads';

  @IsOptional()
  @IsString()
  UPLOADS_PUBLIC_URL?: string = '/uploads';

  @IsOptional()
  @IsString()
  NODE_ENV?: string = 'development';

  @IsOptional()
  @IsString()
  HOST?: string = '0.0.0.0';

  @IsOptional()
  @IsNumber()
  COOKIE_ACCESS_TOKEN_MAX_AGE_MS?: number = 15 * 60 * 1000;

  @IsOptional()
  @IsNumber()
  COOKIE_REFRESH_TOKEN_MAX_AGE_MS?: number = 7 * 24 * 60 * 60 * 1000;

  @IsOptional()
  @IsNumber()
  UPLOAD_FILE_SIZE_LIMIT_BYTES?: number = 10 * 1024 * 1024;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed: ${errors
        .map((e) => Object.values(e.constraints ?? {}))
        .flat()
        .join('; ')}`,
    );
  }
  return validatedConfig;
}
