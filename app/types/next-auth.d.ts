// types/next-auth.d.ts
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: "user" | "admin" | "owner";
      firstName: string;
      lastName: string;
      designation: string;
      passwordResetRequired: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin" | "owner";
    firstName: string;
    lastName: string;
    designation: string;
    passwordResetRequired: boolean;
  }

  interface JWT {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin" | "owner";
    firstName: string;
    lastName: string;
    designation: string;
    passwordResetRequired: boolean;
  }
}
