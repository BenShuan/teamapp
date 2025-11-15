import FighterForm from './components/FighterForm'

import { createFileRoute } from '@tanstack/react-router'

import RoutePending from '@/web/components/route-pending'
import queryClient from '@/web/lib/query-client'
import { fighterQueryOptions } from '../../services/fighter.api'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/web/components/ui/dialog'
import FighterTable from './components/FighterTable'
import FightersList from './components/FightersList'
import { Button } from '@/web/components/ui/button'

const FightersPage = async () => {
  return (
    <div className='mx-4 flex flex-col gap-4 '>
      <div className='hidden md:block'>

        <FighterTable />
      </div>
      <div className='block md:hidden'>

        <FightersList />
      </div>
      <div className="mt-4">
        <Dialog  >
          <DialogTrigger  >
            <Button>
              הוסף חייל
            </Button>
          </DialogTrigger>

          <DialogContent dir='rtl' className="w-5/6 max-w-[800px] max-h-[80vh] overflow-y-scroll flex flex-col text-right  ">
            <DialogTitle  >הוסף חייל</DialogTitle>
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
