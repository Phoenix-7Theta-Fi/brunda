'use client'

import { format } from "date-fns"

interface DateFormatterProps {
  date: string
  className?: string
}

export default function DateFormatter({ date, className }: DateFormatterProps) {
  return (
    <time dateTime={date} className={className}>
      {format(new Date(date), 'PPP')}
    </time>
  )
}
