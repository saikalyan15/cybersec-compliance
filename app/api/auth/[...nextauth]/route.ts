import bcrypt from 'bcryptjs';
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';

// Define authentication options
const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Please enter username and password');
        }

        await dbConnect();

        const user = await User.findOne({ username: credentials.username });
        if (!user) {
          throw new Error('No user found with this username');
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error('Invalid password');
        }

        // Return user data that will be available in the token
        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          name: `${user.firstName} ${user.lastName}`,
        };
      },
    }),
  ],

  // Callbacks for customizing the JWT and session handling
  callbacks: {
    // Modify the JWT token
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },

    // Modify the session
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
      }
      return session;
    },
  },

  // Custom pages for authentication
  pages: {
    signIn: '/auth/signin',
  },

  // Configure the session
  session: {
    strategy: 'jwt',
  },

  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
};

export const { GET, POST } = NextAuth(authOptions);
