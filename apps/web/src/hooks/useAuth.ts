import { useSession, signIn, signOut } from "@hono/auth-js/react";
import { useNavigate } from "@tanstack/react-router";
import { User, UserRole, usersRoles } from "@teamapp/api/schema";

export type AuthStatus = "authenticated" | "unauthenticated" | "loading";


export default function useAuth() {
  const session = useSession();
  const navigate = useNavigate()
  const redirectToHome = () => {
    navigate({ to: "/home" });
  }
  const redirectToSignIn = () => {
    navigate({ to: "/auth/register" });
  }




  const user = session.data?.user as User ?? null;
  const status: AuthStatus = session.status;
  const isAuthenticated = status === "authenticated" && !!user;

  const isAuthorized = (minRoleAuth: UserRole) => {
    
    const userIndex = usersRoles.indexOf(user?.role as UserRole);
    const minRoleIndex = usersRoles.indexOf(minRoleAuth);

    return isAuthenticated && user && userIndex >= minRoleIndex

  }

  return {
    // raw session
    session,
    isAuthorized,
    // derived
    user,
    status,
    isAuthenticated,
    // helpers
    signIn,
    signOut,
    redirectToHome,
    redirectToSignIn
  } as const;
}
