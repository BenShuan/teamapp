"use client";

import { type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import { Field, type FieldRenderProps } from "./Field";
import { cn } from "@/web/lib/utils";
import { type InputProps } from "../ui/input";
import { Autocomplete, type Option } from "../ui/autocomplete";

export type { Option };

export type AutocompleteFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<InputProps, "name"> & {
  name: Path<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  requiredMark?: boolean;
  options: Option[];
  emptyMessage?: string;
  isLoading?: boolean;
};

export function AutocompleteField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  rules,
  requiredMark,
  className,
  options,
  emptyMessage = "No results",
  isLoading = false,
  ...inputProps
}: AutocompleteFieldProps<TFieldValues>) {
  return (
    <Field<TFieldValues, Path<TFieldValues>>
      name={name}
      label={label}
      description={description}
      rules={rules}
      requiredMark={requiredMark}
      className={cn("relative", className)}
      render={({ field, error }: FieldRenderProps<TFieldValues, Path<TFieldValues>>) => (
        <Autocomplete
          id={String(name)}
          {...inputProps}
          options={options}
          value={field.value}
          onValueChange={field.onChange}
          emptyMessage={emptyMessage}
          isLoading={isLoading}
          aria-invalid={!!error}
        />
      )}
    />
  );
}

export default AutocompleteField;

