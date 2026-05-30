/**
 * Shared type definitions for Sistema de Monitoreo.
 *
 * Re-export domain types here as they are defined.
 * Example:
 *   export type { User, UserRole } from './user.js';
 */

/** User roles matching the Prisma UserRole enum. */
export type UserRole = 'ADMIN' | 'SPECIALIST' | 'DIRECTOR' | 'TEACHER';
