# Rule: Authentication & Authorization (Auth & Scope)

> These rules are **always active** for any code touching auth, sessions, or access control.

---

## The Auth Stack

Authentication is handled by **Auth.js** (`@auth/core`) via the **`@hono/auth-js`** adapter.
- Session provider: Hono middleware (`authHandler()`)
- Session user: available in context as `c.get("authUser")`
- Token: available as `c.get("authToken")`

---

## Rule AUTH-1 — Never bypass `attachScope()`

`attachScope()` middleware runs globally on the app and builds the `UserScope` object for every request.
It reads the session user → looks up DB memberships → sets `c.set("scope", ...)`.

**NEVER** call `getUserScope()` directly inside a handler — it already ran.
**ALWAYS** read scope via `getScope(c)` or `c.get("scope")`.

```typescript
// CORRECT
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const scope = getScope(c);  // already computed by attachScope()
  ...
};

// WRONG — double DB call
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const userId = c.get("userId")!;
  const scope = await getUserScope(c.env, userId);  // ❌ redundant
  ...
};
```

---

## Rule AUTH-2 — Role Hierarchy is Strict

| Role | Level | Can do |
|------|-------|--------|
| `FIGHTER` | 0 | Read-only, own data |
| `COMMANDER` | 1 | Create/manage fighters in their teams |
| `CAPTAIN` | 2 | Manage teams within their platoon |
| `ADMIN` | 3 | Unrestricted access to everything |

**NEVER** compare roles as strings. The `requireRole()` middleware handles ordering via `UserRole` enum.

```typescript
// CORRECT — middleware handles the comparison
middleware: [requireScope(), requireRole("COMMANDER")] as const

// WRONG — manual role comparison
if (scope.role === "FIGHTER") throw new ForbiddenError();
```

---

## Rule AUTH-3 — `unrestricted` Flag is Sacred

ADMIN users have `scope.unrestricted = true`. This means **they bypass all team/platoon filters**.

```typescript
// CORRECT — teamScopeWhere handles unrestricted automatically
const fighters = await db.query.fighter.findMany({
  where: teamScopeWhere(scope),  // returns eq(1,1) for ADMIN
});

// WRONG — manual unrestricted check
if (!scope.unrestricted) {
  // filter logic...  ← don't do this manually
}
```

---

## Rule AUTH-4 — `AuthContainer` for UI Access Control

On the frontend, **never** hide UI elements with raw role comparisons. Always use `AuthContainer`:

```typescript
// CORRECT
<AuthContainer requiredRole={UserRole.COMMANDER}>
  <Button>הוסף לוחם</Button>
</AuthContainer>

// WRONG — manual check in JSX
{user?.role === "COMMANDER" && <Button>הוסף לוחם</Button>}
```

---

## Rule AUTH-5 — AppEnv Variables Must Stay in Sync

The `AppEnv.Variables` in `apps/api/src/lib/types.ts` declares all context variables.
When any middleware adds a new value via `c.set(key, value)`, the key **MUST** be added to `Variables`.

Current registered variables:
```typescript
Variables: {
  authToken: string;
  authUser: AuthUser;       // set by @hono/auth-js
  scope: UserScope | null;  // set by attachScope()
  userId: string | null;    // set by attachScope()
}
```

---

## Rule AUTH-6 — Error Types

Always throw the typed errors from `middleware/auth-errors.ts`:
- `throw new UnauthorizedError(message)` → 401
- `throw new ForbiddenError(message)` → 403

**NEVER** use raw `throw new Error()` for auth failures — it returns 500.
