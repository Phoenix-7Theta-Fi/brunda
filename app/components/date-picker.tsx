'use client'

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { DateRange } from "react-day-picker"

interface DatePickerProps {
  date: Date | undefined
  dateRange?: { from: Date; to: Date }
  onSelect: (date?: Date, dateRange?: { from: Date; to: Date }) => void
}

type DateOption = 'today' | '7days' | '30days' | 'custom' | 'single'

export default function DatePicker({ date, onSelect }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dateOption, setDateOption] = useState<DateOption>('single')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const handleOptionSelect = (option: DateOption) => {
    setDateOption(option)
    
    const today = new Date()
    
    switch (option) {
      case 'today':
        onSelect(today)
        setIsOpen(false)
        break
      case '7days':
        onSelect(undefined, { from: subDays(today, 7), to: today })
        setIsOpen(false)
        break
      case '30days':
        onSelect(undefined, { from: subDays(today, 30), to: today })
        setIsOpen(false)
        break
      case 'custom':
      case 'single':
        setIsOpen(true)
        onSelect(undefined, undefined)
        break
    }
  }

  const getButtonText = () => {
    if (dateOption === 'today') return 'Today'
    if (dateOption === '7days') return 'Last 7 Days'
    if (dateOption === '30days') return 'Last 30 Days'
    
    if (dateOption === 'custom' && dateRange) {
      if (!dateRange.to && dateRange.from) {
        return `Select end date (Start: ${format(dateRange.from, 'PP')})`
      }
      if (dateRange.from && dateRange.to) {
        return `${format(dateRange.from, 'PP')} - ${format(dateRange.to, 'PP')}`
      }
    }
    
    if (date) {
      return format(date, 'PPP')
    }
    
    return dateOption === 'custom' ? 'Select date range' : 'Select date'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-md border p-1">
        <Button
          variant="ghost"
          className={`${dateOption === 'today' ? 'bg-muted' : ''}`}
          onClick={() => handleOptionSelect('today')}
        >
          Today
        </Button>
        <Button
          variant="ghost"
          className={`${dateOption === '7days' ? 'bg-muted' : ''}`}
          onClick={() => handleOptionSelect('7days')}
        >
          7 Days
        </Button>
        <Button
          variant="ghost"
          className={`${dateOption === '30days' ? 'bg-muted' : ''}`}
          onClick={() => handleOptionSelect('30days')}
        >
          30 Days
        </Button>
        <Button
          variant="ghost"
          className={`${dateOption === 'custom' ? 'bg-muted' : ''}`}
          onClick={() => handleOptionSelect('custom')}
        >
          Custom
        </Button>
      </div>

      <Popover open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setDateRange(undefined)
        }
        setIsOpen(open)
      }}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={`min-w-[240px] justify-start text-left font-normal ${dateOption === 'custom' && dateRange && !dateRange.to ? 'ring-2 ring-primary' : ''}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getButtonText()}
            <ChevronDownIcon className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {dateOption === 'custom' ? (
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                if (!range?.from) {
                  setDateRange(undefined)
                  return
                }
                if (!range.to) {
                  setDateRange(range)
                  return
                }
                onSelect(undefined, { 
                  from: range.from, 
                  to: range.to 
                })
                setDateRange(undefined)
                setIsOpen(false)
              }}
              initialFocus
              numberOfMonths={2}
            />
          ) : (
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
          )}
        </PopoverContent>
      </Popover>

      {(date || dateRange) && (
        <Button 
          variant="ghost" 
          onClick={() => {
            onSelect(undefined, undefined)
            setDateOption('single')
            setDateRange(undefined)
          }}
          className="text-muted-foreground"
        >
          Clear
        </Button>
      )}
    </div>
  )
}
