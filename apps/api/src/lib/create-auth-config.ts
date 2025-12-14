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
import { getUserScope } from './auth-scope';
import { accounts, sessions, users, verificationTokens } from '../db/schema';

export default function createAuthConfig(env: AppEnv["Bindings"]): AuthConfig {
  const db = drizzle(env.DB);

  return {
    adapter: DrizzleAdapter(db,{
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    }),
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
        if ((token as any)?.role) {
          (session.user as any).role = (token as any).role;
        }
        if ((token as any)?.unrestricted !== undefined) {
          (session.user as any).unrestricted = (token as any).unrestricted;
        }
        if ((token as any)?.teamIds) {
          (session.user as any).teamIds = (token as any).teamIds as string[];
        }
        if ((token as any)?.platoonIds) {
          (session.user as any).platoonIds = (token as any).platoonIds as string[];
        }
        return session;
      },

      async jwt({ token, user }) {
        // Persist user data to token on sign in
        if (user) {
          token.id = (user as any).id;
          token.email = (user as any).email;
          token.name = (user as any).name;
          (token as any).role = (user as any).role;

          // Enrich token with authorization scope (role/teamIds/platoonIds)
          try {
            const userId = (user as any).id ?? token.sub;
            if (userId) {
              const scope = await getUserScope(env, userId);
              if (scope) {
                (token as any).unrestricted = scope.unrestricted;
                (token as any).teamIds = scope.teamIds;
                (token as any).platoonIds = scope.platoonIds;
              }
            }
          } catch (_) {
            // noop: keep token minimal on scope fetch failure
          }
        }
        return token;
      },
    },

  };
}