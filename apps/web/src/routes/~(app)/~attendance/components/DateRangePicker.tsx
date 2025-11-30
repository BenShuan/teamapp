'use client';

import React from 'react';
import { DatePicker } from '@/web/components/ui/date-picker';
import { RefreshCwIcon } from 'lucide-react';
import { getDatesByRange } from '@teamapp/shared';

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
    <div className="flex gap-4 mb-6 items-end " dir="rtl">
      <div>
        <DatePicker label='תאריך התחלה' value={new Date(startDate)}
          onChange={(date) => onStartDateChange(date ? date.toUTCString() : '')}>
          <DatePicker.Input />
        </DatePicker>
      </div>
      <div>
        <DatePicker label='תאריך סיום' value={new Date(endDate)}
          onChange={(date) => onEndDateChange(date ? date.toUTCString() : '')}>
          <DatePicker.Input />
        </DatePicker>
      </div>

      <div className='mb-2'>

        <RefreshCwIcon size={24} className='cursor-pointer hover:text-primary transition-colors'
          onClick={() => {
            const { startDate, endDate } = getDatesByRange(new Date(), 7, 0);
            onStartDateChange(startDate);
            onEndDateChange(endDate);
          }} />
      </div>
    </div>
  );
};
