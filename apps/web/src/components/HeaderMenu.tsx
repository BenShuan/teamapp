import { routes } from "@/lib/routes";
import React from "react";
import { NavigationMenu, NavigationMenuList } from "./ui/navigation-menu";
import HeaderMenuItem from "./HeaderMenuItem";

const HeaderMenu = () => {
  return (
    <NavigationMenu className="my-4 w-full">
      <NavigationMenuList className="mx-auto flex-row-reverse rounded-lg border border-border gap-3 bg-card/80 p-1 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        {routes.map((route) => (
          <HeaderMenuItem key={route.path} route={route}/>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default HeaderMenu;
