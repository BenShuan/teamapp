import AppNavbar from '@/web/components/app-navbar'

import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import useAuth from '@/web/hooks/useAuth'

const AppLayout = () => {

  const { status, isAuthenticated, redirectToSignIn } = useAuth()

  if (status === "loading") {
    return <Loader className="animate-spin mx-auto mt-20" />
  }

  if (!isAuthenticated) {
    redirectToSignIn()
    return null;
  }
  
  return (
    <div>
      <AppNavbar />
      <main className="container my-4 ">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout

export const Route = createFileRoute('/(app)')({
  component: AppLayout,

})
