"use client"

import * as React from "react"
import Field from "./Field"
import { DatePicker } from "../ui/date-picker"

export type DateFieldProps = {
  name: string
  label?: React.ReactNode
  description?: React.ReactNode
  className?: string
}

export function DateField({ name, label, description, className }: DateFieldProps) {
  return (
    <Field
      name={name}
      label={label}
      description={description}
      className={className}
      render={({ field }) => (
        <DatePicker
          value={field.value ?? null}
          onChange={(d: Date | null | undefined) => field.onChange(d)}
          
        >
          <DatePicker.Input />
        </DatePicker>
      )}
    />
  )
}

export default DateField
