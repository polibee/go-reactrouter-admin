import { CalendarIcon } from 'lucide-react'
import * as React from 'react'

import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { cn } from '~/lib/utils'

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' })

type DatePickerProps = Omit<
  React.ComponentProps<typeof Calendar>,
  'mode' | 'selected' | 'onSelect'
> & {
  defaultValue?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

function DatePicker({
  defaultValue,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  className,
  ...calendarProps
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(defaultValue)

  const handleSelect = (nextDate: Date | undefined) => {
    setDate(nextDate)
    onChange?.(nextDate)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          data-empty={!date}
          disabled={disabled}
          className={cn(
            'data-[empty=true]:text-muted-foreground w-[280px] justify-start px-3 text-left font-normal',
            className,
          )}
        >
          <CalendarIcon className="size-4" />
          {date ? dateFormatter.format(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
export type { DatePickerProps }
