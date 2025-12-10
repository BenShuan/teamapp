import { cn } from "@/web/lib/utils";
import { Input, type InputProps } from "./input";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverAnchor } from "./popover";

export type Option = { label: string; value: string | number };

export type AutocompleteProps = Omit<InputProps, "value" | "onChange"> & {
  options: Option[];
  value?: string | number;
  onValueChange?: (value: string | number) => void;
  emptyMessage?: string;
  isLoading?: boolean;
};

export function Autocomplete({
  options,
  value,
  onValueChange,
  emptyMessage = "No results",
  isLoading = false,
  className,
  ...inputProps
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (options.length > 0 && value !== undefined) {
      setQuery(options.find((o) => o.value === value)?.label ?? "");
    }
  }, [isLoading, options, value]);

  const filtered = useMemo(() => {
    const q = String(query).toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const onSelect = (opt: Option) => {
    console.log('opt', opt)
    setQuery(opt.label);
    onValueChange?.(opt.value);
    setOpen(false);
    setActiveIndex(-1);
  };

  const openPop = useCallback(() => setOpen(true), [open])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      console.log('focus')
    }
  }, [open])


  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((idx) => Math.min(filtered.length - 1, idx + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((idx) => Math.max(0, idx - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && filtered[activeIndex]) {
      e.preventDefault();
      onSelect(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>

      <PopoverAnchor asChild >
        <Input
          autoComplete="off"
          {...inputProps}
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={openPop}
          onBlur={(e) => {
            inputProps.onBlur?.(e);
          }}
          onKeyDown={onKeyDown}
          className={className}
        />
      </PopoverAnchor>
      <PopoverContent >
        <div className="max-h-56 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</div>
          ) : (
            <ul className="py-1 text-sm">
              {filtered.map((opt, idx) => (
                <li
                  key={String(opt.value)}
                  className={cn(
                    "cursor-pointer px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                    idx === activeIndex && "bg-accent text-accent-foreground"
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onSelect(opt)}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>

  );
}
