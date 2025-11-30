// src/middleware/auth.ts
import { getAuthUser } from '@hono/auth-js';
import { createMiddleware } from 'hono/factory';
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { UserRole } from '../db/schema';


export const requireAuth = () => {
  return createMiddleware(async (c, next) => {
    const auth = await getAuthUser(c);
    console.log('auth', auth)
    if (!auth?.user) {
      return c.json({
        message: HttpStatusPhrases.NOT_FOUND

      },
        HttpStatusCodes.NOT_FOUND,

      )
    }

    c.set('user', auth.user);
    await next();
  });
};



// Require specific role
export const requireRole = (role: UserRole) => {
  return createMiddleware(async (c, next) => {
    const auth = await getAuthUser(c);

    if (!auth?.user
      //  || auth.user.role !== role
      ) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    c.set('user', auth.user);
    await next();
  });
};
