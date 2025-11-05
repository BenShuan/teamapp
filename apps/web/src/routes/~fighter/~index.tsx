import FighterForm from './components/FighterForm'

import { createFileRoute } from '@tanstack/react-router'

import RoutePending from '@/web/components/route-pending'
import queryClient from '@/web/lib/query-client'
import { fighterQueryOptions } from './utils/apiService'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/web/components/ui/dialog'
import FighterTable from './components/FighterTable'

const FightersPage = async () => {
  return (
    <div className='mx-4 flex flex-col gap-4'>
      <FighterTable />
      {/* <FightersList /> */}
      <div className="mt-4">
        <Dialog  >
          <DialogTrigger  >הוסף חייל</DialogTrigger>

          <DialogContent dir='rtl' className="w-5/6 max-w-[800px] max-h-[80vh] overflow-y-scroll flex flex-col text-right ">
            <DialogTitle >הוסף חייל</DialogTitle>
            <FighterForm />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default FightersPage

export const Route = createFileRoute('/fighter/')({
  component: FightersPage,
  loader: () => queryClient.ensureQueryData(fighterQueryOptions),
  pendingComponent: RoutePending,
})
