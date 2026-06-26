export interface AppConfig {
  port: number;
  host: string;
  frontendUrl: string;
  databaseUrl: string;
  nodeEnv: string;
  isProduction: boolean;

  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    bcryptSaltRounds: number;
  };

  smtp: {
    host?: string;
    port: number;
    user?: string;
    pass?: string;
    emailFrom: string;
  };

  uploads: {
    basePath: string;
    publicUrl: string;
    fileSizeLimitBytes: number;
  };

  cookies: {
    accessTokenMaxAgeMs: number;
    refreshTokenMaxAgeMs: number;
  };
}

export function config(env: Record<string, unknown>): AppConfig {
  return {
    port: (env.PORT as number) ?? 3000,
    host: (env.HOST as string) ?? '0.0.0.0',
    frontendUrl: (env.FRONTEND_URL as string) ?? 'http://localhost:5173',
    databaseUrl: (env.DATABASE_URL as string) ?? '',
    nodeEnv: (env.NODE_ENV as string) ?? 'development',
    isProduction: (env.NODE_ENV as string) === 'production',

    jwt: {
      secret: (env.JWT_SECRET as string) ?? '',
      refreshSecret: (env.JWT_REFRESH_SECRET as string) ?? '',
      expiresIn: (env.JWT_EXPIRES_IN as string) ?? '15m',
      refreshExpiresIn: (env.JWT_REFRESH_EXPIRES_IN as string) ?? '7d',
      bcryptSaltRounds: (env.BCRYPT_SALT_ROUNDS as number) ?? 12,
    },

    smtp: {
      host: env.SMTP_HOST as string | undefined,
      port: (env.SMTP_PORT as number) ?? 1025,
      user: env.SMTP_USER as string | undefined,
      pass: env.SMTP_PASS as string | undefined,
      emailFrom: (env.EMAIL_FROM as string) ?? 'no-reply@ugel-lampa.gob.pe',
    },

    uploads: {
      basePath: (env.UPLOADS_BASE_PATH as string) ?? './uploads',
      publicUrl: (env.UPLOADS_PUBLIC_URL as string) ?? '/uploads',
      fileSizeLimitBytes: (env.UPLOAD_FILE_SIZE_LIMIT_BYTES as number) ?? 10 * 1024 * 1024,
    },

    cookies: {
      accessTokenMaxAgeMs: (env.COOKIE_ACCESS_TOKEN_MAX_AGE_MS as number) ?? 15 * 60 * 1000,
      refreshTokenMaxAgeMs: (env.COOKIE_REFRESH_TOKEN_MAX_AGE_MS as number) ?? 7 * 24 * 60 * 60 * 1000,
    },
  };
}
