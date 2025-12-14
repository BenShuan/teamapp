// Centralized list of top-level routes for the app navbar
// Keep this in sync with files under `apps/web/src/routes`

import { UserRole } from "@teamapp/api/schema";
import { LucideIcon, Home, Users, Clock, Shield, Package } from "lucide-react";

export type NavMainItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  requiresRole?: UserRole[]
  items?: {
    title: string
    url: string
    requiresRole?: UserRole[]
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
        requiresRole: [UserRole.ADMIN, UserRole.COMMANDER],
      },
    ],
  },
  {
    title: "ציוד סדרתי",
    url: "/serialized-gear",
    icon: Package,
    requiresRole: [UserRole.ADMIN, UserRole.COMMANDER, UserRole.FIGHTER],
    items: [
      {
        title: "בדיקת ציוד",
        url: "/serialized-gear/check",
      },
    ],
  },
  {
    title: "מנהל",
    url: "/admin",
    icon: Shield,
    requiresRole: [UserRole.ADMIN],
  },
]

export default navMainItems;
