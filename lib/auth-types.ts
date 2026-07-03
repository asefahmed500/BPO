import type { auth } from "./auth";

export type AuthSession = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};

export type AuthUser = AuthSession["user"];
