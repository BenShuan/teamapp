"use client";

import * as React from "react";
import { type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import { Field, type FieldRenderProps } from "./Field";
import { Textarea } from "../ui/textarea";

export type TextareaFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<React.ComponentProps<"textarea">, "name"> & {
  name: Path<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  requiredMark?: boolean;
};

export function TextareaField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  rules,
  requiredMark,
  className,
  ...props
}: TextareaFieldProps<TFieldValues>) {
  return (
    <Field<TFieldValues, Path<TFieldValues>>
      name={name}
      label={label}
      description={description}
      rules={rules}
      requiredMark={requiredMark}
      className={className}
      render={({ field, error }: FieldRenderProps<TFieldValues, Path<TFieldValues>>) => (
        <Textarea id={String(name)} {...props} {...field} aria-invalid={!!error} />
      )}
    />
  );
}

export default TextareaField;

