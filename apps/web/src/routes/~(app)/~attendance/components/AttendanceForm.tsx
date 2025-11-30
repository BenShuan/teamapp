'use client';

import React from 'react';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';
import { Attendance, statusLocations, UpdateAttendance } from '@teamapp/api/schema';
import { Button } from '@/web/components/ui/button';
import { Card, CardContent } from '@/web/components/ui/card';
import { useUpdateAttendance } from '@/web/hooks/useAttendance';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/web/components/ui/dropdown-menu';
import { cn } from '@/web/lib/utils';
import { attendnanceColorMap } from './AttendanceCell';
import { TimeField } from '@/web/components/forms';

interface AttendanceFormProps {
  attendance: Attendance;
  fighterName: string;
  onClose?: () => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  attendance,
  fighterName,
  onClose,
}) => {
  const { mutate: updateAttendance, isPending } = useUpdateAttendance();
  const methods = useForm<UpdateAttendance>({
    defaultValues: {
      location: attendance?.location,
      checkIn: attendance?.checkIn || undefined,
      checkOut: attendance?.checkOut || undefined,
      notes: attendance?.notes || '',
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { isDirty } } = methods;

  const location = watch('location');

  const onSubmit: SubmitHandler<UpdateAttendance> = (data) => {

    const saveData={
      ...data,
      checkIn: data.checkIn ? new Date(data.checkIn):null,
      checkOut:data.checkOut? new Date(data.checkOut) :null,
    }

    updateAttendance(
      {
        id: attendance.id,
        attendance: saveData,
      },
      {
        onSuccess: () => {
          onClose?.();
        },
      }
    );
  };

  return (
    <FormProvider {...methods}>
      <Card className="w-full border-none shadow-none">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Fighter Name Header */}
            <div className="border-b pb-3">
              <h3 className="font-semibold text-sm">{fighterName}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(attendance.workDate).toLocaleDateString('he-IL')}
              </p>
            </div>

            {/* Location Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">מיקום</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    type="button"
                    className={cn(
                      "w-full justify-between",
                      location ? attendnanceColorMap[location] : ""
                    )}
                  >
                    {location || 'בחר מיקום'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {statusLocations.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => setValue('location', status as any)}
                      className={cn(
                        "cursor-pointer",
                        attendnanceColorMap[status] || ''
                      )}
                    >
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Check-In Time */}
            <div className="space-y-2">
              <TimeField name='checkIn' label='זמן הגעה' />
            </div>

            {/* Check-Out Time */}
            <div className="space-y-2">
              <TimeField name='checkOut' label='זמן הגעה' />

            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">הערות</label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="הוסף הערות..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="flex-1"
              >
                ביטול
              </Button>
              <Button type="submit" disabled={isPending || !isDirty} className="flex-1">
                {isPending ? 'שמירה...' : 'שמור'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
};
