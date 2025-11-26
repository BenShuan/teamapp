'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/web/components/ui/dialog';
import { Attendance } from '@teamapp/api/schema';
import { AttendanceForm } from './AttendanceForm';

interface AttendancePopoverProps {
  attendance: Attendance;
  fighterName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AttendancePopover: React.FC<AttendancePopoverProps> = ({
  attendance,
  fighterName,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-right">עדכן נוכחות</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <AttendanceForm
          attendance={attendance}
          fighterName={fighterName}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
