'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useState, useCallback, useEffect } from "react";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  dateRange?: { from: Date; to: Date };
  onSelect: (dateRange?: { from: Date; to: Date }) => void;
}

export default function DateRangePicker({ dateRange, onSelect }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(dateRange ? { 
    from: dateRange.from, 
    to: dateRange.to 
  } : undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Add debug info to window
    if (typeof window !== 'undefined') {
      (window as any).debugDateRange = { dateRange, selectedRange, isOpen };
    }
  }, [dateRange, selectedRange, isOpen]);

  const handlePopoverChange = useCallback((open: boolean) => {
    console.log("DateRangePicker: Popover change", open);
    setIsOpen(open);
  }, []);

  const handleRangeSelect = useCallback((range: DateRange | undefined) => {
    console.log("DateRangePicker: Range selected", range);
    
    if (!range?.from) {
      setSelectedRange(undefined);
      return;
    }
    
    setSelectedRange(range);
    
    if (range.from && range.to) {
      onSelect({ from: range.from, to: range.to });
      setIsOpen(false);
    }
  }, [onSelect, setSelectedRange, setIsOpen]);

  const handleClear = useCallback(() => {
    console.log("DateRangePicker: Clearing range");
    onSelect(undefined);
    setSelectedRange(undefined);
  }, [onSelect, setSelectedRange]);

  const handleQuickSelectToday = useCallback(() => {
    const today = new Date();
    const range = { 
      from: startOfDay(today), 
      to: endOfDay(today) 
    };
    console.log("DateRangePicker: Quick select today", range);
    setSelectedRange(range);
    onSelect(range);
    setIsOpen(false);
  }, [onSelect]);

  const handleQuickSelect7Days = useCallback(() => {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    const range = { from: sevenDaysAgo, to: today };
    console.log("DateRangePicker: Quick select 7 days", range);
    setSelectedRange(range);
    onSelect(range);
    setIsOpen(false);
  }, [onSelect]);

  const handleQuickSelect30Days = useCallback(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const range = { from: thirtyDaysAgo, to: today };
    console.log("DateRangePicker: Quick select 30 days", range);
    setSelectedRange(range);
    onSelect(range);
    setIsOpen(false);
  }, [onSelect]);

  const getButtonText = useCallback(() => {
    if (!selectedRange?.from) {
      return "Select date range";
    }
    
    if (!selectedRange.to) {
      return `Start: ${format(selectedRange.from, 'PP')} — Select end date`;
    }
    
    return `${format(selectedRange.from, 'PP')} — ${format(selectedRange.to, 'PP')}`;
  }, [selectedRange]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="bg-blue-100 hover:bg-blue-200"
          onClick={handleQuickSelectToday}
        >
          Today
        </Button>
        <Button
          variant="ghost"
          className="bg-blue-100 hover:bg-blue-200"
          onClick={handleQuickSelect7Days}
        >
          Last 7 Days
        </Button>
        <Button
          variant="ghost"
          className="bg-blue-100 hover:bg-blue-200"
          onClick={handleQuickSelect30Days}
        >
          Last 30 Days
        </Button>
      </div>

      <Popover 
        open={isOpen} 
        onOpenChange={handlePopoverChange}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={`min-w-[240px] justify-start text-left font-normal border-2 ${selectedRange?.from && !selectedRange.to ? 'border-blue-500' : 'border-input'}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getButtonText()}
            <ChevronDownIcon className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-2 border-blue-500" align="start">
          <div className="date-range-container">
            <div className="p-3 border-b bg-blue-100">
              <h4 className="font-medium text-sm">Select Date Range</h4>
              <p className="text-xs text-blue-700 mt-1">
                {!selectedRange?.from ? 
                  "Click to select start date" : 
                  !selectedRange.to ? 
                    `Selected: ${format(selectedRange.from, 'PP')} — Click to select end date` :
                    `${format(selectedRange.from, 'PP')} — ${format(selectedRange.to, 'PP')}`
                }
              </p>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={selectedRange?.from}
              selected={selectedRange}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              className="p-3 date-range-calendar"
            />
            <div className="p-3 border-t bg-blue-100">
              <p className="text-xs font-medium text-blue-700">
                {selectedRange?.from && !selectedRange.to ? 
                  "Now select your end date" : 
                  !selectedRange?.from ? 
                    "First click a start date, then select an end date" : 
                    "Range selected"
                }
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {selectedRange && (selectedRange.from || selectedRange.to) && (
        <Button 
          variant="ghost"
          onClick={handleClear}
          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
