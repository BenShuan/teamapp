import useAuth from '@/web/hooks/useAuth'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminUsersTable } from '@/web/components/admin-users-table'
import { AdminPlatoonsTeamsManager } from '@/web/components/admin-platoons-teams'
import AppNavbar from '@/web/components/app-navbar'

export const Route = createFileRoute('/admin/')({
  beforeLoad: async ({ context }) => {
    const role = (context.session?.data as any)?.user?.role
    if (role !== 'ADMIN') {
      throw redirect({ to: '/' })
    }
  },
  component: AdminPage,
})

function AdminPage() {
  const { session } = useAuth()
  return (

    <div className="container mx-auto" dir="rtl">

      <AppNavbar >

        <div className='flex flex-col'>
          <h1 className="text-3xl font-bold">מערכת מנהל</h1>
          <p className="mt-2 text-sm text-gray-600">
            ברוך הבא, {session?.data?.user?.name}
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">

            <section>
              {/* Platoons & Teams Management */}
              <h2 className="text-2xl font-semibold mb-4">פלוגות וצוותים</h2>
              <AdminPlatoonsTeamsManager />
            </section>

            {/* Users Management */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">משתמשים</h2>
              <AdminUsersTable />
            </section>
        </div>
      </AppNavbar>
    </div>


  )
}
