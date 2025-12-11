import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/attendance/daily/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/attendance/daily/"!</div>
}
