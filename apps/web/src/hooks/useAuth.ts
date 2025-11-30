import { useSession, signIn, signOut } from "@hono/auth-js/react";
import { useNavigate } from "@tanstack/react-router";

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



  const user = session.data?.user ?? null;
  const status: AuthStatus = session.status;
  const isAuthenticated = status === "authenticated" && !!user;

  return {
    // raw session
    session,
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
