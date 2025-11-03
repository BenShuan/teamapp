import { createFileRoute } from '@tanstack/react-router'

function FighterItemPage() {
  return <div>page</div>
}

export const Route = createFileRoute('/fighter/$id/')({
  component: FighterItemPage,
})
export default FighterItemPage
