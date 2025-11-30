import type { register, meScope } from "./auth.routes";
import { users } from "@/api/db/schema/auth";
import { getUserScope } from "@/api/lib/auth-scope";
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { AppRouteHandler } from "@/api/lib/types";
import { createDb } from "@/api/db";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants";

// Simple SHA-256 hashing using Web Crypto (supported in Workers)
async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyUser(email: string, password: string, db = createDb((globalThis as any).ENV)) {
  const hash = await hashPassword(password);
  const rows = await db.select().from(users).where(() => eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user) return null;
  if (user.password !== hash) return null;
  const { password: _pw, ...safeUser } = user as any;
  return safeUser;
}

export const registerHandler: AppRouteHandler<typeof register> = async (c) => {
  const db = createDb(c.env);
  const { name, email, password, role } = c.req.valid("json");

  // Check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return c.json({ message: "Email already exists" }, HttpStatusCodes.CONFLICT);
  }
  const passwordHash = await hashPassword(password);
  const [{ password: hashedPassword, ...inserted }] = await db.insert(users).values({ name, email, role, password: passwordHash }).returning();
  console.log('inserted', inserted)
  if (!inserted) {
    return c.json({
      success: false,
      error: {
        issues: [
          {
            code: ZOD_ERROR_CODES.INVALID_UPDATES,
            path: [],
            message: ZOD_ERROR_MESSAGES.NO_UPDATES,
          },
        ],
        name: "ZodError",
      },
    }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
  }

  return c.json(inserted, HttpStatusCodes.CREATED);
};

export const meScopeHandler: AppRouteHandler<typeof meScope> = async (c) => {
  // Attempt to derive user id from auth context
  const authUser: any = c.get("authUser");
  const authToken: any = c.get("authToken");
  const userId = authUser?.id || authToken?.sub || authToken?.id;
  if (!userId) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }
  const scope = await getUserScope(c.env, userId);
  if (!scope) {
    return c.json({ message: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
  }
  return c.json(scope, HttpStatusCodes.OK);
};


// export const verifyUser = async (email: string, password: string, db: ReturnType<typeof createDb>) => {
//   const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
//   if (user.length === 0) {
//     console.log('No user found with email:', email);
//     return null;
//   }
//   const passwordHash = await hashPassword(password);
//   if (user[0].password !== passwordHash) {
//     console.log('Password mismatch for email:', email);
//     return null;
//   }
//   return user[0];
// }