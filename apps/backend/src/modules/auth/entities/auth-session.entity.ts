export class AuthSession {
  id!: string;
  userId!: string;
  sessionJti!: string;
  ipAddress!: string | null;
  userAgent!: string | null;
  startedAt!: Date;
  lastActivityAt!: Date;
  expiresAt!: Date;
  loggedOutAt!: Date | null;
  terminatedReason!: string | null;
  isActive!: boolean;
}
