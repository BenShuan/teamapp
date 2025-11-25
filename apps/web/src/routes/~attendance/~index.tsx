"use client";

import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { DateRangePicker } from './components/DateRangePicker';
import { AttendanceTable } from './components/AttendanceTable';

const AttendancePage = () => {
  // Default to today for both start and end
  const today = new Date().toISOString().split('T')[0];

  // Default to 7 days back for start date
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(sevenDaysAgo);
  const [endDate, setEndDate] = useState(today);


  return (
    <div className="mx-4 flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-right">נוכחות</h1>
        
      </div>

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {startDate && endDate && (
        <AttendanceTable startDate={startDate} endDate={endDate} />
      )}
    </div>
  );
};

export default AttendancePage;

export const Route = createFileRoute('/attendance/')({
  component: AttendancePage,
});
