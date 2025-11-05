// Centralized list of top-level routes for the app navbar
// Keep this in sync with files under `apps/web/src/routes`

export type AppNavItem = {
  to: string;
  label: string;
  requiresAuth?: boolean;
};

// Map routes by their label for quick lookup
export const appNavRoutes = {
  Home: { to: "/", label: "בית" },
  Fighter: { to: "/fighter", label: "לוחמים" },
} as const satisfies Record<string, AppNavItem>;

export type AppNavRoutesMap = typeof appNavRoutes;

export default appNavRoutes;
