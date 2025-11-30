import type { SessionContext } from "@hono/auth-js/react";

import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { Toaster } from "../components/ui/sonner";

type Session = Parameters<typeof SessionContext>[0]["value"];

export const Route = createRootRouteWithContext<{
  session: Session;
}>()({
  component: () => (
    <div className="h-dvh overflow-scroll bg-background flex flex-col items-center-safe ">
      <main className="container my-4 " >
        <Outlet />
        <TanStackRouterDevtools />
      </main>
      <Toaster/>
    </div>
  ),
});
