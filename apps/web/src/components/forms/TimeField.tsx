"use client";

import * as React from "react";
import { Input, type InputProps } from "@/web/components/ui/input";
import Field from "./Field";

export type TimeFieldProps = Omit<InputProps, "name"> & {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};

export function TimeField({ name, label, description, className, ...inputProps }: TimeFieldProps) {
  return (
    <Field
      name={name}
      label={label}
      description={description}
      className={className}
      render={({ field }) => (
        <Input
          id={String(name)}
          type="time"
          {...inputProps}
          value={
            field.value instanceof Date
              ? (field.value as Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : typeof field.value === 'string' && field.value.length > 0
              ? field.value
              : ''
          }
          onChange={(e) => {
            const time = e.target.value; // "HH:MM"
            if (!time) {
              field.onChange(null);
              return;
            }
            
            // If the current value is a Date, preserve its date portion
            let baseDate: Date;
            if (field.value instanceof Date) {
              baseDate = new Date(field.value as Date);
            } else {
              baseDate = new Date();
            }
            
            const [hoursStr, minutesStr] = time.split(':');
            const hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);
            baseDate.setHours(hours, minutes, 0, 0);
            
            field.onChange(baseDate);
          }}
        />
      )}
    />
  );
}

export default TimeField;
