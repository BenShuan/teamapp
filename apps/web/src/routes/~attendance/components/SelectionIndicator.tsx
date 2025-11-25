'use client';

import React from 'react';
import { useAttendanceTable } from './AttendanceTableContext';
import { Button } from '@/web/components/ui/button';
import { Attendance } from '@teamapp/api/schema';

interface SelectionIndicatorProps {
  allItems: Attendance[];
}

export const SelectionIndicator: React.FC<SelectionIndicatorProps> = ({ allItems }) => {
  const { pickedIds, clearPicks ,togglePick} = useAttendanceTable();
  const totalItems = allItems.length;
  const selectedCount = pickedIds.size;

  const handleClearSelection = () => {
    clearPicks();
  };
  const pickAll = () => {
    allItems.forEach(item => togglePick(item.id));
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-md border">
      <div className="text-sm font-medium">
        {selectedCount === 0 ? (
          <span className="text-muted-foreground">אין תאים נבחרים</span>
        ) : (
          <span>
            {selectedCount === totalItems ? (
              <span className="text-green-600 font-semibold">✓ הכל נבחר</span>
            ) : (
              <span className="text-blue-600">
                {selectedCount} מתוך {totalItems} נבחרים
              </span>
            )}
          </span>
        )}
      </div>

      {selectedCount !== totalItems && (
        <Button
          size="sm"
          variant="ghost"
          onClick={pickAll}
          className="ml-auto text-xs"
        >
          בחר הכל
        </Button>
      )}
      {selectedCount > 0 && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleClearSelection}
          className="ml-auto text-xs"
        >
          ❌ נקה
        </Button>
      )}
    </div>
  );
};
