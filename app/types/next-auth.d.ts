// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      username: string;
      role: 'admin' | 'user' | 'owner';
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string;
    username: string;
    role: 'admin' | 'user' | 'owner';
  }

  interface JWT {
    id: string;
    username: string;
    role: 'admin' | 'user' | 'owner';
  }
}
