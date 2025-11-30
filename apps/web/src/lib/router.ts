// Centralized list of top-level routes for the app navbar
// Keep this in sync with files under `apps/web/src/routes`

import { FileRoutesByTo } from "../route-tree.gen";

export type AppNavItem = {
  to: keyof FileRoutesByTo;
  label: string;
  requiresAuth?: boolean;
};

// Map routes by their label for quick lookup
export const appNavRoutes = {
  Home: { to: "/home", label: "בית" },
  Fighter: { to: "/fighter", label: "לוחמים" },
  Attendance: { to: "/attendance", label: "נוכחות" },
} as const satisfies Record<string, AppNavItem>;

export type AppNavRoutesMap = typeof appNavRoutes;

export default appNavRoutes;
