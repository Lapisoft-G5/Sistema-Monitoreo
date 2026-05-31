import { User } from '../entities/user.entity.js';

export abstract class AuthRepository {
  abstract findUserByEmail(email: string): Promise<User | null>;
}
