"use client";

import { type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import { Field, type FieldRenderProps } from "./Field";
import { cn } from "@/web/lib/utils";
import { Input, type InputProps } from "../ui/input";
import { useEffect, useMemo, useState } from "react";

export type Option = { label: string; value: string | number };

export type AutocompleteFieldProps<TFieldValues extends FieldValues = FieldValues> = Omit<InputProps, "name"> & {
  name: Path<TFieldValues>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  requiredMark?: boolean;
  options: Option[];
  emptyMessage?: string;
  isLoading?:boolean;
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
  isLoading =false,
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
      render={({ field, error }: FieldRenderProps<TFieldValues, Path<TFieldValues>>) => {
        const [open, setOpen] = useState(false);
        const [query, setQuery] = useState<string>("");

        useEffect(() => {
          if (options.length > 0) {
            setQuery(options.find((o) => o.value === field.value)?.label??'')
          }
        }, [isLoading])


        const filtered = useMemo(() => {
          const q = String(query).toLowerCase();
          return options.filter((o) => o.label.toLowerCase().includes(q));
        }, [options, query]);

        const onSelect = (opt: Option) => {
          setQuery(opt.label);
          field.onChange(opt.value);
          setOpen(false);
        };

        return (
          <div className="relative">
            <Input
              id={String(name)}
              {...inputProps}
              value={query}
              aria-invalid={!!error}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={(e) => {
                // Delay to allow click on option
                setTimeout(() => setOpen(false), 100);
                inputProps.onBlur?.(e);
              }}
            />

            {open && (
              <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</div>
                ) : (
                  <ul className="py-1 text-sm">
                    {filtered.map((opt) => (
                      <li
                        key={String(opt.value)}
                        className="cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onSelect(opt)}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      }}
    />
  );
}

export default AutocompleteField;

