"use client";

import * as React from "react";
import { type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import { Input, type InputProps } from "../ui/input";
import { Field, type FieldRenderProps } from "./Field";

export type TextFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<InputProps, "name"> & {
  name: Path<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  requiredMark?: boolean;
};

export function TextField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  rules,
  requiredMark,
  className,
  ...inputProps
}: TextFieldProps<TFieldValues>) {
  return (
    <Field<TFieldValues, Path<TFieldValues>>
      name={name}
      label={label}
      description={description}
      rules={rules}
      requiredMark={requiredMark}
      className={className}
      render={({ field, error }: FieldRenderProps<TFieldValues, Path<TFieldValues>>) => (
        <Input id={String(name)} {...inputProps} {...field} aria-invalid={!!error} />
      )}
    />
  );
}

export default TextField;

