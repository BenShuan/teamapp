import { UserRole } from "@teamapp/api/schema";
import type { NavMainItem } from "./router";

export function filterNavItems(items: NavMainItem[], userRole?: UserRole): NavMainItem[] {
  if (!userRole) return [];
console.log('userRole', userRole)
console.log('items', items)
  return items.filter(item => {
    // Check if item requires specific roles
    if (item.requiresRole && !item.requiresRole.includes(userRole)) {
      return false;
    }

    // Filter sub-items if they exist
    if (item.items) {
      const filteredSubItems = item.items.filter(subItem => {
        if (subItem.requiresRole && !subItem.requiresRole.includes(userRole)) {
          return false;
        }
        return true;
      });

      // Return item with filtered sub-items
      return {
        ...item,
        items: filteredSubItems,
      };
    }

    return true;
  }).map(item => {
    // Apply sub-item filtering
    if (item.items) {
      const filteredSubItems = item.items.filter(subItem => {
        if (subItem.requiresRole && !subItem.requiresRole.includes(userRole)) {
          return false;
        }
        return true;
      });

      return {
        ...item,
        items: filteredSubItems,
      };
    }
    return item;
  });
}
