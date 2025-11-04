import { signOut, useSession } from "@hono/auth-js/react";
import { Link, useLocation } from "@tanstack/react-router";
import appNavRoutes from "@/web/lib/router";

export default function AppNavbar() {
  const location = useLocation();
  const session = useSession();
  return (
    <nav className="container gap-4">
      <ul>
        <li><strong>הצוות</strong></li>
      </ul>
      <ul className="flex-1">
        {Object.values(appNavRoutes).map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <li key={item.label} aria-current={isActive ? "page" : undefined}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          );
        })}
        {session.data?.user && (
          <>
            <li className="user-avatar">
              <img src={session.data.user.image!} />
              <p>{session.data.user.name}</p>
            </li>
            <li>
              <button
                type="button"
                className="outline contrast"
                onClick={() => signOut()}
              >
                Sign Out
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
