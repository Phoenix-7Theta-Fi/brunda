'use client';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { useState, useCallback, useEffect } from "react";

interface DatePickerProps {
  date: Date | undefined;
  onSelect: (date?: Date) => void;
}

export default function DatePicker({ date, onSelect }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Add debug info to window
    if (typeof window !== 'undefined') {
      (window as any).debugDateSingle = { date, isOpen };
    }
  }, [date, isOpen]);

  const handlePopoverChange = useCallback((open: boolean) => {
    console.log("DatePicker: Popover change", open);
    setIsOpen(open);
  }, []);

  const handleSingleSelect = useCallback((selectedDate: Date | undefined) => {
    console.log("DatePicker: Date selected", selectedDate);
    onSelect(selectedDate);
    setIsOpen(false);
  }, [onSelect, setIsOpen]);

  const handleClear = useCallback(() => {
    console.log("DatePicker: Clearing date");
    onSelect(undefined);
  }, [onSelect]);

  const getButtonText = useCallback(() => {
    if (date) {
      return format(date, 'PPP');
    }
    
    return "Select date";
  }, [date]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Popover 
        open={isOpen} 
        onOpenChange={handlePopoverChange}>
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
            onSelect={handleSingleSelect}
            initialFocus
            numberOfMonths={1}
            className="single-date-calendar"
          />
        </PopoverContent>
      </Popover>

      {date && (
        <Button 
          variant="ghost" 
          onClick={handleClear}
          className="text-muted-foreground"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
