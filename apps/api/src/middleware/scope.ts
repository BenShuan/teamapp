import { AppEnv } from "@/api/lib/types";
import {  getUserScope, UserScope } from "@/api/lib/auth-scope";
import type { MiddlewareHandler } from "hono";
import { UnauthorizedError, ForbiddenError } from "./auth-errors";
import {  UserRole } from "../db/schema";

export function attachScope(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const authUser: any = c.get("authUser");
    const authToken: any = c.get("authToken");
    const userId = authUser?.id || authToken?.sub || authToken?.id;
    if (!userId) {
      // No user; proceed without scope (public endpoints can still run)
      c.set("scope", null as unknown as UserScope);
      return next();
    }
    const scope = await getUserScope(c.env, userId);
    c.set("scope", scope);
    return next();
  };
}

export function requireScope(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const scope = c.get("scope") as UserScope | null;
    if (!scope) {
      throw new UnauthorizedError("Authentication required");
    }
    return next();
  };
}

export function requireRole(minRole: keyof typeof UserRole): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const scope = c.get("scope") as UserScope | null;
    if (!scope) {
      throw new UnauthorizedError("Authentication required");
    }
    if (UserRole[minRole ] > UserRole[scope.role as keyof typeof UserRole]) {
      throw new ForbiddenError("Insufficient permissions");
    }
    return next();
  };
}

export function getScope(c: any): UserScope | null {
  const scope = c.get("scope") as UserScope | null;
  return scope ?? null;
}

export function assertScope(scope: UserScope | null, message?: string): asserts scope is UserScope {
  if (!scope) {
    throw new UnauthorizedError(message || "Authentication required");
  }
}

export function assertRole(scope: UserScope | null, allowedRoles: (keyof typeof UserRole)[], message?: string): void {
  assertScope(scope);
  if (!allowedRoles.includes(scope.role)) {
    throw new ForbiddenError(message || "Insufficient permissions");
  }
}
