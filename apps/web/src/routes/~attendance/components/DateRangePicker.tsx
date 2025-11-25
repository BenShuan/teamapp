'use client';

import React from 'react';
import { Input } from '@/web/components/ui/input';
import { Label } from '@/web/components/ui/label';
import DatePicker, { DatePickerCalendar, DatePickerInput, DatePickerRoot } from '@/web/components/ui/date-picker';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className="flex gap-4 mb-6 items-end" dir="rtl">

      <DatePickerRoot label='תאריך התחלה'>
        <DatePickerInput  />
        <DatePickerCalendar/>
      </DatePickerRoot>

      <div>
        <Label htmlFor="start-date" className="block mb-2">
          תאריך התחלה
        </Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-40"
        />
      </div>
      <div>
        <Label htmlFor="end-date" className="block mb-2">
          תאריך סיום
        </Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-40"
        />
      </div>
    </div>
  );
};
