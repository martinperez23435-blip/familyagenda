export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}