import { createFileRoute, useParams } from '@tanstack/react-router'
import FighterForm from '../components/FighterForm'
import { useFighters } from '@/web/hooks/useFighter'
import queryClient from '@/web/lib/query-client'
import RoutePending from '@/web/components/route-pending'
import { fighterItemQueryOptions } from '../../../services/fighter.api'

function FighterItemPage() {
  const { id } = useParams({ from: "/fighter/$id/" })
  const { data } = useFighters(id)
  return <div>
    <FighterForm fighter={data} />
  </div>
}

export const Route = createFileRoute('/fighter/$id/')({
  component: FighterItemPage,
  loader: ({params:{id}}) => queryClient.ensureQueryData(fighterItemQueryOptions(id)),
    pendingComponent: RoutePending,
})
export default FighterItemPage
