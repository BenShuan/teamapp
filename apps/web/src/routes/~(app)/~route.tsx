import AppNavbar from '@/web/components/app-navbar'
import { useSession } from '@hono/auth-js/react'

import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

const AppLayout = () => {
  const sesseion = useSession()

  const navigate = useNavigate()
  console.log('session', sesseion)

  if (sesseion.status === 'loading') {
    return <Loader className="animate-spin mx-auto mt-20" />
  }

  if (!sesseion.data?.user) {
    navigate({ to: '/auth/register' })
    return null
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
