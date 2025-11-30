# Authorization Configuration Guide

All create, patch, and delete operations now have `requireScope()` middleware applied. This ensures users are authenticated before modifying data.

## How to Add Role Restrictions

Replace `requireScope()` with `requireRole('role1', 'role2', ...)` to restrict operations to specific roles.

### Available Roles
Based on your `UserRole` enum:
- `fighter` - Basic user
- `commander` - Platoon commander
- `captain` - Team captain
- `admin` - Full access

## Current Configuration

### Fighters (`apps/api/src/routes/fighters/fighters.routes.ts`)

```typescript
// Create fighter - Line ~28
middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander', 'captain') if needed

// Update fighter - Line ~72
middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander', 'captain') if needed

// Delete fighter - Line ~107
middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander') if needed
```

**Recommendation**: 
- Create/Update: Allow captains, commanders, and admins
- Delete: Restrict to commanders and admins only

**Example**:
```typescript
middleware: [requireRole('admin', 'commander', 'captain')] as const,
```

---

### Teams (`apps/api/src/routes/teams/teams.routes.ts`)

```typescript
// Create team - Line ~27
middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander') if needed

// Update team - Line ~72
middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander') if needed

// Delete team - Line ~106
middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander') if needed
```

**Recommendation**: 
- All operations: Restrict to commanders and admins (teams are organizational structure)

**Example**:
```typescript
middleware: [requireRole('admin', 'commander')] as const,
```

---

### Attendance (`apps/api/src/routes/attendance/attendance.routes.ts`)

```typescript
// Create attendance - Line ~32
middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander', 'captain') if needed

// Update attendance - Line ~75
middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander', 'captain') if needed

// Delete attendance - Line ~109
middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander') if needed
```

**Recommendation**: 
- Create/Update: Allow captains, commanders, and admins (daily operations)
- Delete: Restrict to commanders and admins only (prevent accidental removal)

**Example**:
```typescript
middleware: [requireRole('admin', 'commander', 'captain')] as const,
```

---

## Quick Replace Guide

1. **Allow all authenticated users** (current state):
   ```typescript
   middleware: [requireScope()] as const,
   ```

2. **Admin only**:
   ```typescript
   middleware: [requireRole('admin')] as const,
   ```

3. **Commanders and admins**:
   ```typescript
   middleware: [requireRole('admin', 'commander')] as const,
   ```

4. **Captains, commanders, and admins**:
   ```typescript
   middleware: [requireRole('admin', 'commander', 'captain')] as const,
   ```

## Testing Authorization

After updating roles, test with different user roles:

```bash
# As admin - should work
curl -H "Authorization: Bearer <admin_token>" -X POST http://localhost:8787/api/fighters

# As fighter - should get 403 Forbidden
curl -H "Authorization: Bearer <fighter_token>" -X POST http://localhost:8787/api/fighters
```

Expected 403 response:
```json
{
  "success": false,
  "error": {
    "message": "Insufficient permissions",
    "code": "FORBIDDEN"
  }
}
```
