'use client'

import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { DateRangePicker } from './components/DateRangePicker'
import { AttendanceTable } from './components/AttendanceTable'
import { MobileAttendanceView } from './components/MobileAttendanceView'
import { ErrorPage } from '@/web/components/ErrorPage'
import { useDutyPeriods } from '@/web/hooks/useDutyPeriod'
import type { DutyPeriod } from '@teamapp/api/schema'
import { formatHebrewDate } from '@teamapp/shared'
import { Autocomplete } from '@/web/components/ui/autocomplete'
import { Label } from '@/web/components/ui/label'

const AttendancePage = () => {
  const { data: dutyPeriods = [] } = useDutyPeriods()

  const [selectedDutyPeriodId, setSelectedDutyPeriodId] = useState<string | null>(null)
  const [startDateState, setStartDate] = useState<string>('')
  const [endDateState, setEndDate] = useState<string>('')

  // Auto-select the open period on load
  useEffect(() => {
    if ((dutyPeriods as DutyPeriod[]).length > 0 && selectedDutyPeriodId === null) {
      const openPeriod = (dutyPeriods as DutyPeriod[]).find(dp => dp.isOpen)
      if (openPeriod) {
        setSelectedDutyPeriodId(openPeriod.id)
        setStartDate(openPeriod.startDate)
        setEndDate(openPeriod.endDate)
      } else {
        // Default to the first (most recent) period
        const first = (dutyPeriods as DutyPeriod[])[0]
        setSelectedDutyPeriodId(first.id)
        setStartDate(first.startDate)
        setEndDate(first.endDate)
      }
    }
  }, [dutyPeriods, selectedDutyPeriodId])

  const handleDutyPeriodChange = (periodId: string) => {
    const period = (dutyPeriods as DutyPeriod[]).find(dp => dp.id === periodId)
    if (period) {
      setSelectedDutyPeriodId(period.id)
      setStartDate(period.startDate)
      setEndDate(period.endDate)
    }
  }

  return (
    <div className="mx-4 flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-right">נוכחות {selectedDutyPeriodId ? `- ${dutyPeriods.find(dp => dp.id === selectedDutyPeriodId)?.name ?? ''}` : ''}</h1>
        <div className="flex flex-col gap-3 mb-6 leading-none px-1">
          <Label htmlFor="dutyPeriodId" className="text-sm font-medium whitespace-nowrap ">תקופת צו</Label>
          {/* <Autocomplete
                  id="dutyPeriodId"
                  value={selectedDutyPeriodId}
                  placeholder="בחר תקופת צו"
                  onValueChange={(value) => setSelectedDutyPeriodId(value as string)}
                  options={
                    (dutyPeriods as DutyPeriod[]).filter(dp => dp.isOpen).map(dp => ({ label: dp.name || "ללא שם", value: dp.id }))
                  }
                /> */}

          <select
            id="dutyPeriodId"
            value={selectedDutyPeriodId ?? ''}
            onChange={(e) => handleDutyPeriodChange(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm bg-background"
          >
            <option value="">בחר תקופת צו</option>
            {(dutyPeriods as DutyPeriod[]).filter(dp => dp.isOpen).map(dp => (
              <option key={dp.id} value={dp.id}>
                {dp.name || "ללא שם"} {formatHebrewDate(dp.startDate)} - {formatHebrewDate(dp.endDate)}
              </option>
            ))}
          </select>
        </div>
      </div>



      {selectedDutyPeriodId && startDateState && endDateState && (
        <>
          <div className="hidden md:block">
            {/* Duty Period Selector */}
            <div className="flex items-center gap-3" dir="rtl">

              <DateRangePicker
                startDate={startDateState}
                endDate={endDateState}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>
            {/* Desktop View */}
            <AttendanceTable
              dutyPeriodId={selectedDutyPeriodId}
              startDate={startDateState}
              endDate={endDateState}
            />
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <MobileAttendanceView
              dutyPeriodId={selectedDutyPeriodId}
              startDate={startDateState}
              endDate={endDateState}
            />
          </div>
        </>
      )}

      {!selectedDutyPeriodId && (dutyPeriods as DutyPeriod[]).length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          אין תקופות צו. יש ליצור תקופת צו בממשק המנהל.
        </div>
      )}
    </div>
  )
}

export default AttendancePage

export const Route = createFileRoute('/(app)/attendance/')({
  component: AttendancePage,
  errorComponent: () => <ErrorPage />,
})
