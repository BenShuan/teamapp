import { signOut, useSession } from "@hono/auth-js/react";
import { Link } from "@tanstack/react-router";
import appNavRoutes from "@/web/lib/router";
import { Button } from "./ui/button";
import teamAppLogo from "../../public/team-app-icon.png"

export default function AppNavbar() {
  const session = useSession();
  const user = session.data?.user;
  return (
    <nav className="container gap-4 w-full flex bg-accent px-4 py-2 ">
      <ul className="flex-1 flex gap-4 items-center">
        <li>
          <div className="flex items-center gap-2">
            <img src={teamAppLogo} alt="TeamApp" width={60}  />
            <strong>הצוות</strong>
          </div>
        </li>
        {Object.values(appNavRoutes).map((item) => {
          return (
            <li key={item.label}   >
              <Link activeProps={{ className: "text-shadow-accent font-bold" }} className="hover:font-bold hover:underline" to={item.to}>{item.label}</Link>
            </li>
          );
        })}
        <li  >
          <Link activeProps={{ className: "text-shadow-accent font-bold" }} className="hover:font-bold hover:underline" to={"/admin"}>מנהל</Link>
        </li>
        <li className="mr-auto flex items-center gap-3">
          {user && (
            <>
              {user.image ? (
                <img src={user.image} alt="avatar" className="h-6 w-6 rounded-full" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {(user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="text-sm ">{user.name ?? user.email}</span>
              <Button variant={"secondary"} type="button" className="px-3 py-1.5 text-sm border rounded" onClick={() => signOut({ callbackUrl: "/" })}>התנתק</Button>
            </>
          )}
        </li>
      </ul>
    </nav>
  );
}
