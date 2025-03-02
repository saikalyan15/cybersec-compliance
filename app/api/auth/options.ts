import bcrypt from 'bcryptjs';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/app/lib/dbConnect';
import User from '@/app/models/User';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          await dbConnect();

          console.log('Attempting login for username:', credentials?.username);

          // Find user
          const user = await User.findOne({ username: credentials?.username });

          if (!user) {
            console.log('User not found');
            throw new Error('Invalid username or password');
          }

          // Check password
          const isValid = await bcrypt.compare(
            credentials?.password || '',
            user.password
          );

          if (!isValid) {
            console.log('Invalid password');
            throw new Error('Invalid username or password');
          }

          console.log('Login successful for user:', user.username);

          // Return user object
          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            designation: user.designation,
          };
        } catch (error) {
          console.error(
            'Authentication error:',
            error instanceof Error ? error.message : 'Unknown error'
          );
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.designation = user.designation;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.designation = token.designation as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
};
