"use client";

import * as React from "react";
import { Controller, type Control, type FieldValues, type Path, type RegisterOptions, useFormContext } from "react-hook-form";
import { Label } from "../ui/label";
import { cn } from "@/web/lib/utils";

export type FieldRenderProps<TFieldValues extends FieldValues, TName extends Path<TFieldValues>> = {
  field: import("react-hook-form").ControllerRenderProps<TFieldValues, TName>;
  error?: import("react-hook-form").FieldError;
};

export type FieldProps<TFieldValues extends FieldValues = FieldValues, TName extends Path<TFieldValues> = Path<TFieldValues>> = {
  name: TName;
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  control?: Control<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, TName>;
  requiredMark?: boolean;
  render: (props: FieldRenderProps<TFieldValues, TName>) => React.ReactNode;
};

export function Field<TFieldValues extends FieldValues = FieldValues, TName extends Path<TFieldValues> = Path<TFieldValues>>({
  name,
  label,
  description,
  className,
  control,
  rules,
  requiredMark,
  render,
}: FieldProps<TFieldValues, TName>) {
  // Try to read control from context if not provided
  let ctx: ReturnType<typeof useFormContext<TFieldValues>> | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ctx = useFormContext<TFieldValues>();
  } catch (_) {
    ctx = undefined;
  }

  const usedControl = control ?? ctx?.control;

  if (!usedControl) {
    throw new Error("Field requires a react-hook-form control or to be used inside FormProvider");
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <Label htmlFor={String(name)} className="flex items-center gap-1">
          {label}
          {requiredMark ? <span className="text-destructive">*</span> : null}
        </Label>
      ) : null}
      <Controller
        name={name as Path<TFieldValues>}
        control={usedControl}
        rules={rules}
        render={({ field, fieldState }) => (
          <div className="space-y-1.5">
            {render({ field, error: fieldState.error })}
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
            {fieldState.error ? (
              <p className="text-xs text-destructive">{fieldState.error.message}</p>
            ) : null}
          </div>
        )}
      />
    </div>
  );
}

export default Field;

