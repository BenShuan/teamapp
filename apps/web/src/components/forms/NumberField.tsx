"use client";

import * as React from "react";
import { type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import { Field, type FieldRenderProps } from "./Field";
import { Input,type InputProps } from "../ui/input";
export type NumberFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<InputProps, "name" | "type"> & {
  name: Path<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  requiredMark?: boolean;
  valueAsNumber?: boolean; // default true
};

export function NumberField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  rules,
  requiredMark,
  valueAsNumber = true,
  className,
  ...inputProps
}: NumberFieldProps<TFieldValues>) {
  return (
    <Field<TFieldValues, Path<TFieldValues>>
      name={name}
      label={label}
      description={description}
      rules={rules}
      requiredMark={requiredMark}
      className={className}
      render={({ field, error }: FieldRenderProps<TFieldValues, Path<TFieldValues>>) => (
        <Input
          id={String(name)}
          type="number"
          inputMode="numeric"
          {...inputProps}
          {...field}
          onChange={(e) => {
            const v = e.target.value;
            if (valueAsNumber) {
              const parsed = v === "" ? undefined : Number(v);
              field.onChange(Number.isNaN(parsed as number) ? undefined : parsed);
            } else {
              field.onChange(v);
            }
          }}
          value={field.value ?? ""}
          aria-invalid={!!error}
        />
      )}
    />
  );
}

export default NumberField;

