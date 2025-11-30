// src/auth.ts
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { drizzle } from 'drizzle-orm/d1';
import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';
import type { AuthConfig } from '@auth/core';
import { AppEnv } from './types';
import { verifyUser } from '../routes/auth/auth.handlers';
import { createDb } from '../db';

export default function createAuthConfig(env: AppEnv["Bindings"]): AuthConfig {
  const db = drizzle(env.DB);

  return {
    adapter: DrizzleAdapter(db),
    session: {
      strategy: "jwt",
    },
    providers: [
      GitHub({
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      }),
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
      Credentials({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },

        async authorize(credentials) {
          // Your authentication logic here

          const user = await verifyUser(credentials.email as string, credentials.password as string, createDb(env));
          if (user) {
            return user;
          }
          return null;
        },
      }),
    ],
    secret: env.AUTH_SECRET,
    trustHost: true,
    callbacks: {
      async session({ session, token }) {
        console.log('session callback fired', { token, sessionUser: session.user });
        // Add user data from token to session
        if (token?.sub) {
          session.user.id = token.sub;
        }
        if (token?.email) {
          session.user.email = token.email as string;
        }
        if (token?.name) {
          session.user.name = token.name as string;
        }
        if (token?.role) {
          (session.user as any).role = token.role;
        }
        return session;
      },

      async jwt({ token, user }) {
        console.log('jwt callback fired', { user, token });
        // Persist user data to token on sign in
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.role = (user as any).role;
        }
        return token;
      },
    },

  };
}