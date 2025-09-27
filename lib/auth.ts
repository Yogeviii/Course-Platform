// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "./mongoClientPromise";
import { dbConnect } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        await dbConnect();
        const user = await User.findOne({ email: creds?.email });
        if (!user) return null;
        const ok = await bcrypt.compare(String(creds?.password ?? ""), user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) (token as any).role = (user as any).role || "user";
      return token;
    },
    async session({ session, token }) {
      (session as any).user.role = (token as any).role || "user";
      return session;
    },
  },
};
