import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/attendance/reports/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/attendance/daily/"!</div>
}
  