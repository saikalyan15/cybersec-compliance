import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            throw new Error("Missing username or password");
          }

          await dbConnect();
          const user = await User.findOne({ username: credentials.username });

          if (!user) {
            throw new Error("Invalid username or password");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isValid) {
            throw new Error("Invalid username or password");
          }

          return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            designation: user.designation,
            passwordResetRequired: user.passwordResetRequired,
          };
        } catch (error: any) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.designation = user.designation;
        token.passwordResetRequired = user.passwordResetRequired;
      }

      // Handle updates to the session
      if (
        trigger === "update" &&
        session?.passwordResetRequired !== undefined
      ) {
        token.passwordResetRequired = session.passwordResetRequired;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.role = token.role as "user" | "admin" | "owner";
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.designation = token.designation as string;
        session.user.passwordResetRequired =
          token.passwordResetRequired as boolean;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Update user's last login time if needed
      try {
        await dbConnect();
        await User.findByIdAndUpdate(user.id, {
          lastLogin: new Date(),
        });
      } catch (error) {
        console.error("Error updating last login:", error);
      }
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
