import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '@/web/components/ui/card'
import { Input } from '@/web/components/ui/input'
import { Autocomplete } from '@/web/components/ui/autocomplete'

import { useTeams } from '@/web/hooks/useTeams'
import { useFighters } from '@/web/hooks/useFighter'
import { useSerializedGear } from '@/web/hooks/useSerializedGear'
import { useGearCatalog } from '@/web/hooks/useSerializedGear'
import { createGearCheck } from '@/web/services/serializedGear.api'
import { type SerializedGearFighter } from '@teamapp/api/schema'
import { Checkbox } from '@/web/components/ui/checkbox'

export const Route = createFileRoute('/(app)/gear/serialized-gear/check')({
  component: SerializedGearCheckPage,
})

function SerializedGearCheckPage() {
  const queryClient = useQueryClient()
  const { teamsMap } = useTeams()
  const { fightersMap } = useFighters()
  const { data: assignments = [] } = useSerializedGear()
  const { catalogMap } = useGearCatalog()

  const [teamId, setTeamId] = useState<string>('')
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  )
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({})

  const filteredAssignments = useMemo(() => {
    if (!Array.isArray(assignments)) return [] as SerializedGearFighter[]
    if (!teamId) return [] as SerializedGearFighter[]
    return assignments.filter(
      (a: SerializedGearFighter) => a.fightersTeamId === teamId,
    )
  }, [assignments, teamId, fightersMap])

  // Pre-check items that were already checked on the selected date
  useEffect(() => {
    const next: Record<string, boolean> = {}
    for (const a of filteredAssignments) {
      // Check if there's a check record for the selected date
      const hasCheck =
        Array.isArray(a.checks) &&
        a.checks.some((c: any) => {
          const checkDate = c.date ? String(c.date).slice(0, 10) : ''
          return checkDate === date && c.isCheck
        })
      next[a.id] = hasCheck
    }
    setCheckedIds(next)
  }, [filteredAssignments, date])

  useEffect(() => {
    if (Object.entries(teamsMap).length > 0 && !teamId) {
      setTeamId(Object.values(teamsMap)[0].value.id)
    }
  }, [teamsMap])

  const groupedByType = useMemo(() => {
    const groups: Record<string, SerializedGearFighter[]> = {}
    for (const a of filteredAssignments) {
      const type = catalogMap[a.serializedGearId]?.value.type || 'אחר'
      ;(groups[type] ||= []).push(a)
    }
    return groups
  }, [filteredAssignments, catalogMap])

  const patchMutation = useMutation({
    mutationFn: async ({ id, isCheck }: { id: string; isCheck: boolean }) => {
      return createGearCheck(id, date, isCheck)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serialized-gear'] })
    },
  })

  const toggleChecked = (id: string) => {
    const newState = !checkedIds[id]
    setCheckedIds((prev) => ({ ...prev, [id]: newState }))
    // Immediately create/update the check record
    patchMutation.mutate({ id, isCheck: newState })
  }

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-2xl font-semibold">בדיקת ציוד סדרתי</h1>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">בחר צוות</label>
            <Autocomplete
              placeholder="הקלד שם צוות"
              options={Object.values(teamsMap).map((t) => ({
                label: t.label,
                value: t.value.id,
              }))}
              value={teamId}
              onValueChange={(val) => setTeamId(String(val))}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">תאריך בדיקה</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-6">
        {filteredAssignments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            אין ציוד משויך לצוות שנבחר.
          </p>
        ) : (
          Object.entries(groupedByType).map(([type, items]) => (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{type}</h3>
                <span className="text-sm text-muted-foreground">
                  {items.length} פריטים
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {items.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded border"
                  >
                    <div className="text-right">
                      <div className="font-medium">
                        {`${catalogMap[a.serializedGearId].label} - ${a.serialNumber} ` ||
                          '—'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        לוחם: {fightersMap[a.fighterId].label || '—'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        מיקום: {a.location || '—'}
                      </div>
                    </div>
                    <Checkbox
                      checked={!!checkedIds[a.id]}
                      onCheckedChange={() => toggleChecked(a.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
