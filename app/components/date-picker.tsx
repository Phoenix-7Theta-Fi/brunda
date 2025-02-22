'use client'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
}

export default function DatePicker({ date, onSelect }: DatePickerProps) {
  return (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            {date ? format(date, 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {date && (
        <Button variant="ghost" onClick={() => onSelect(undefined)}>
          Clear filter
        </Button>
      )}
    </div>
  )
}
