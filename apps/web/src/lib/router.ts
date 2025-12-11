// Centralized list of top-level routes for the app navbar
// Keep this in sync with files under `apps/web/src/routes`

import { LucideIcon, Home, Users, Clock, Shield } from "lucide-react";

export type NavMainItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

// Map routes for the sidebar navigation
const navMainItems: NavMainItem[] = [
  {
    title: "בית",
    url: "/home",
    icon: Home,
    isActive: true,
  },
  {
    title: "לוחמים",
    url: "/fighter",
    icon: Users,
  },
  {
    title: "נוכחות",
    url: "/attendance",
    icon: Clock,
    items: [
      {
        title: "טבלת נוכחות",
        url: "/attendance",
      },
      {
        title: "נוכחות יומית",
        url: "/attendance/daily",
      },
      {
        title: "דוחות נוכחות",
        url: "/attendance/reports",
      },
    ],
  },
  {
    title: "מנהל",
    url: "/admin",
    icon: Shield,
  },
]

export default navMainItems;
