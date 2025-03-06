import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string;
      username?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: 'user' | 'admin' | 'owner';
      passwordResetRequired?: boolean;
    } & DefaultSession['user'];
  }
}
