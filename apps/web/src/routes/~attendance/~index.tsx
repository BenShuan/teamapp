"use client";

import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { DateRangePicker } from './components/DateRangePicker';
import { AttendanceTable } from './components/AttendanceTable';
import { getDatesByRange } from '@/web/lib/date-formatter';
import { ErrorPage } from '@/web/components/ErrorPage';

const AttendancePage = () => {
  const { startDate, endDate } = getDatesByRange(new Date(), 7, 0)

  const [startDateState, setStartDate] = useState(startDate);
  const [endDateState, setEndDate] = useState(endDate);
  return (
    <div className="mx-4 flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-right">נוכחות</h1>
        
      </div>
    

      <DateRangePicker
        startDate={startDateState}
        endDate={endDateState}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
    
      {startDateState && endDateState && (
        <AttendanceTable startDate={startDateState} endDate={endDateState} />
      )}
    </div>
  );
};

export default AttendancePage;

export const Route = createFileRoute('/attendance/')({
  component: AttendancePage,
  errorComponent: ()=><ErrorPage/>
});
