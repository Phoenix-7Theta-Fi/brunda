'use client'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons"
import { useState } from "react"

interface DatePickerProps {
  date: Date | undefined
  onSelect: (date?: Date) => void
}

export default function UploadDatePicker({ date, onSelect }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getButtonText = () => {
    return date ? format(date, 'PPP') : 'Select date'
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="min-w-[240px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getButtonText()}
            <ChevronDownIcon className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              onSelect(date)
              setIsOpen(false)
            }}
            initialFocus
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>

      {date && (
        <Button 
          variant="ghost" 
          onClick={() => {
            onSelect(undefined)
          }}
          className="text-muted-foreground"
        >
          Clear
        </Button>
      )}
    </div>
  )
}
