"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Label } from "./label"
import { Input } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { Calendar as BaseCalendar } from "./calendar"

type DateValue = Date | null | undefined

interface DatePickerRootProps {
  value?: DateValue
  defaultValue?: DateValue
  onChange?: (d: DateValue) => void
  id?: string
  label?: string
  children?: React.ReactNode
}

interface DatePickerContextValue extends DatePickerRootProps {
  open: boolean
  setOpen: (v: boolean) => void
  stringValue?: string
  setStringValue?: (s: string) => void
  month?: Date | undefined
  setMonth?: (d: Date | undefined) => void
}

const DatePickerContext = React.createContext<DatePickerContextValue | undefined>(undefined)

const formatDate = (date: Date | undefined) => {
  if (!date) return ""
  return date
    .toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })
    .replaceAll(".", "/")
}

const isValidDate = (date: Date | undefined) => (date ? !isNaN(date.getTime()) : false)

const DatePickerRoot: React.FC<DatePickerRootProps> = ({ value, defaultValue, onChange, id, label, children }) => {
  const [open, setOpen] = React.useState(false)

  const [dateState, setDateState] = React.useState<DateValue>(value ?? defaultValue ?? new Date("2025-06-01"))

  React.useEffect(() => {
    if (value !== undefined) setDateState(value ?? null)
  }, [value])

  const setValue = React.useCallback((d: DateValue) => {
    if (onChange) onChange(d ?? null)
    if (value === undefined) setDateState(d ?? null)
  }, [onChange, value])

  // string value for the input
  const [stringValue, setStringValue] = React.useState<string>(formatDate(dateState ?? undefined))
  const [month, setMonth] = React.useState<Date | undefined>(dateState ?? undefined)

  React.useEffect(() => {
    setStringValue(formatDate(dateState ?? undefined))
  }, [dateState])

  const ctx = React.useMemo(() => ({
    open,
    setOpen,
    value: dateState,
    setValue,
    id,
    stringValue,
    setStringValue,
    month,
    setMonth,
  }), [open, dateState, setValue, id, stringValue, month])

  return (
    <DatePickerContext.Provider value={ctx as any}>
      <div className="flex flex-col gap-3">
        {label ? <Label htmlFor={id} className="px-1">{label}</Label> : null}
        {children}
      </div>
    </DatePickerContext.Provider>
  )
}

interface DatePickerInputProps extends React.ComponentProps<typeof Input> {
  placeholder?: string
}

const DatePickerInput = React.forwardRef<HTMLInputElement, DatePickerInputProps>((props, ref) => {
  const { className, placeholder = "June 01, 2025", ...rest } = props
  const ctx = React.useContext(DatePickerContext) as any
  const { value, setValue, setOpen, id, stringValue, setStringValue, month, setMonth } = ctx

  return (
    <div className="relative flex gap-2">
      <Input
        id={id}
        value={stringValue}
        placeholder={placeholder}
        className={["bg-background pr-10", className].filter(Boolean).join(" ")}
        onChange={(e) => {
          const v = e.target.value
          setStringValue?.(v)
          const parsed = new Date(v)
          if (isValidDate(parsed)) {
            setValue(parsed)
            setMonth?.(parsed)
          }
          if (typeof (props as any).onChange === "function") (props as any).onChange(e)
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
          if (typeof (props as any).onKeyDown === "function") (props as any).onKeyDown(e)
        }}
        ref={ref}
        {...rest}
      />

      <Popover open={ctx.open} onOpenChange={ctx.setOpen}>
        <PopoverTrigger asChild>
          <Button id={`${id}-trigger`} variant="ghost" className="absolute top-1/2 right-2 size-6 -translate-y-1/2">
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">בחר תאריך</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
          <BaseCalendar
            mode="single"
            selected={value ?? undefined}
            captionLayout="dropdown"
            month={month}
            onMonthChange={(m) => setMonth?.(m)}
            onSelect={(d) => {
              setValue(d ?? null)
              setStringValue?.(formatDate(d ?? undefined))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
})
DatePickerInput.displayName = "DatePickerInput"

const DatePickerCalendar: React.FC<{ captionLayout?: React.ComponentProps<typeof BaseCalendar>["captionLayout"] }> = ({ captionLayout }) => {
  const ctx = React.useContext(DatePickerContext) as any
  const { setOpen, value, setValue, month, setMonth } = ctx
  return (
    <PopoverContent className="w-full overflow-hidden p-0" align="start">
      <BaseCalendar
        mode="single"
        selected={value ?? undefined}
        classNames={{ weekday: "p-2" }}
        captionLayout={captionLayout ?? "dropdown"}
        month={month}
        onMonthChange={(m) => setMonth?.(m)}
        onSelect={(d) => {
          setValue(d ?? null)
          setOpen(false)
        }}
      />
    </PopoverContent>
  )
}

const DatePicker = Object.assign(DatePickerRoot, {
  Input: DatePickerInput,
  Calendar: DatePickerCalendar,
}) as unknown as React.FC<DatePickerRootProps> & {
  Input: typeof DatePickerInput
  Calendar: typeof DatePickerCalendar
}

export { DatePicker }
export default DatePicker
