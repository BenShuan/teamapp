"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Label } from "./label"
import { Button } from "./button"
import { Input } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Calendar as BaseCalendar } from "./calendar"

type DateValue = Date | null | undefined

interface DatePickerContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  value: DateValue
  setValue: (d: DateValue) => void
  id?: string
  // string representation for the input
  stringValue?: string
  setStringValue?: (s: string) => void
  // month shown in calendar
  month?: Date | undefined
  setMonth?: (d: Date | undefined) => void
}

const DatePickerContext = React.createContext<DatePickerContextValue | undefined>(undefined)

function useDatePickerContext() {
  const ctx = React.useContext(DatePickerContext)
  if (!ctx) throw new Error("DatePicker components must be used within DatePicker.Root")
  return ctx
}

function formatDate(date: Date | undefined) {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })
}

function isValidDate(date: Date | undefined) {
  if (!date) return false
  return !isNaN(date.getTime())
}

function useControllableValue(value: DateValue | undefined, defaultValue: DateValue | undefined, onChange?: (d: DateValue) => void) {
  const [state, setState] = React.useState<DateValue>(value ?? defaultValue ?? null)
  React.useEffect(() => {
    if (value !== undefined) setState(value ?? null)
  }, [value])
  const set = React.useCallback((next: DateValue) => {
    if (onChange) onChange(next ?? null)
    if (value === undefined) setState(next ?? null)
  }, [onChange, value])
  return [state, set] as const
}

export interface DatePickerRootProps {
  value?: DateValue
  defaultValue?: DateValue
  onChange?: (d: DateValue) => void
  id?: string
  label?: string
  children?: React.ReactNode
}

export const DatePickerRoot: React.FC<DatePickerRootProps> = ({ value, defaultValue, onChange, id, label, children }) => {
  const [open, setOpen] = React.useState(false)

  // date state (controllable)
  const [dateState, setDateState] = useControllableValue(value, defaultValue, onChange)

  // string value for the text input (user-editable)
  const [stringValue, setStringValue] = React.useState<string>(formatDate(dateState ?? undefined))

  // month shown in the calendar
  const [month, setMonth] = React.useState<Date | undefined>(dateState ?? undefined)

  // keep stringValue in sync when dateState changes
  React.useEffect(() => {
    setStringValue(formatDate(dateState ?? undefined))
  }, [dateState])

  const ctx = React.useMemo(() => ({
    open,
    setOpen,
    value: dateState,
    setValue: setDateState,
    id,
    stringValue,
    setStringValue,
    month,
    setMonth,
  }), [open, dateState, setDateState, id, stringValue, month, setMonth])

  return (
    <DatePickerContext.Provider value={ctx}>
      <div className="flex flex-col gap-3">
        {label ? <Label htmlFor={id} className="px-1">{label}</Label> : null}
        {children}
      </div>
    </DatePickerContext.Provider>
  )
}

export interface DatePickerInputProps extends React.ComponentProps<typeof Input> {
  placeholder?: string
}

export const DatePickerInput = React.forwardRef<HTMLInputElement, DatePickerInputProps>((props, ref) => {
  const { className, placeholder = "June 01, 2025", children, ...rest } = props
  const { value, setValue, setOpen, id, stringValue, setStringValue, month, setMonth } = useDatePickerContext()

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

      <Popover open={value !== undefined ? false : undefined} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={`${id}-trigger`}
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
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

export interface DatePickerCalendarProps {
  captionLayout?: React.ComponentProps<typeof BaseCalendar>["captionLayout"]
}

export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({ captionLayout }) => {
  const { setOpen, value, setValue, month, setMonth } = useDatePickerContext()

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
          // Calendar from the project may pass Date | undefined
          setValue(d ?? null)
          setOpen(false)
        }}
      />
    </PopoverContent>
  )
}

// Compose the main export
export const DatePicker = Object.assign(DatePickerRoot, {
  Input: DatePickerInput,
  Calendar: DatePickerCalendar,
})

export default DatePicker
