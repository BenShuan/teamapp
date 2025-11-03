"use client";
import React from "react";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { AppRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DynamicIcon } from "lucide-react/dynamic";
import { usePathname } from "next/navigation";

const HeaderMenuItem = ({ route }: { route: AppRoute }) => {
  const pathname = usePathname();
  const isRoot = route.path === "/";
  const isActive = isRoot ? pathname === "/" : pathname?.startsWith(route.path || "") ?? false;

  return (
    <NavigationMenuItem key={route.path}>
      <NavigationMenuLink
        asChild
        className={cn(
          navigationMenuTriggerStyle(),
          "transition-colors",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Link
          href={route.path}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "flex items-center gap-2",
            isActive && "after:absolute after:-bottom-1 after:left-2 after:right-2 after:h-0.5 after:rounded after:bg-primary-foreground/70 relative"
          )}
        >
          <span>{route.title}</span>
          <DynamicIcon name={route.icon} size={18} />
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

export default HeaderMenuItem;
