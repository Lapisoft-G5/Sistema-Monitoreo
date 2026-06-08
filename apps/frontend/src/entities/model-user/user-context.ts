import { createContext } from 'react';

export interface UserContextType {
  user: import('./model').User | null;
  setUser: (user: import('./model').User | null) => void;
  isAuthenticated: boolean;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType | null>(null);
