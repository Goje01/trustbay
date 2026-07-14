import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { id, nowIso, readDb, updateDb } from "./db";
import { sendNotification } from "./notifications";
import { verifyPassword } from "./password";
import { roleForEmail } from "./admin";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password || "";
        if (!email || !password) return null;

        const data = await readDb();
        const user = data.users.find((item) => item.email === email);
        if (!user || !verifyPassword(password, user.passwordHash)) return null;

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          image: user.profilePhotoUrl || null
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "PASTE_YOUR_GOOGLE_CLIENT_SECRET_HERE"
    })
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      const googleProfile = profile as Record<string, unknown>;
      const googleSub = String(googleProfile.sub || "");
      const googleName = String(googleProfile.name || "");
      const googlePicture = String(googleProfile.picture || "");
      let createdUserName = "";

      await updateDb((data) => {
        const existing = data.users.find((user) => user.email === email);
        if (existing) {
          existing.googleSub = googleSub || existing.googleSub;
          existing.fullName = existing.fullName || googleName;
          existing.profilePhotoUrl = googlePicture || existing.profilePhotoUrl || "";
          existing.updatedAt = nowIso();
          return;
        }

        const user = {
          id: id("usr"),
          googleSub,
          fullName: googleName,
          email,
          phone: "",
          department: "",
          level: "",
          matricNumberEncrypted: "",
          profilePhotoUrl: googlePicture,
          passwordHash: undefined,
          role: roleForEmail(email, data),
          createdAt: nowIso(),
          updatedAt: nowIso()
        };
        data.users.push(user);
        createdUserName = user.fullName || "Student";
      });

      if (createdUserName) await sendNotification("account_created", email, { name: createdUserName });

      return true;
    },
    async jwt({ token }) {
      if (!token.email) return token;
      const data = await readDb();
      const user = data.users.find((item) => item.email === token.email?.toLowerCase());
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.fullName || token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || "");
        session.user.role = String(token.role || "buyer");
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const data = await readDb();
  return data.users.find((user) => user.email === session.user?.email?.toLowerCase()) || null;
}

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
