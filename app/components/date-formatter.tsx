'use client'

import { format } from "date-fns"
import { useState, useEffect, useCallback } from "react"

interface DateFormatterProps {
  date: string
  className?: string
}

export default function DateFormatter({ date, className }: DateFormatterProps) {
  const [formattedDate, setFormattedDate] = useState<string>("")

  const formatDate = useCallback(() => {
    try {
      const parsedDate = new Date(date)
      console.log('DateFormatter - Input:', date)
      console.log('DateFormatter - Parsed:', parsedDate)
      console.log('DateFormatter - ISO:', parsedDate.toISOString())
      console.log('DateFormatter - Local:', parsedDate.toString())
      
      // Adjust for local timezone
      const offset = parsedDate.getTimezoneOffset() * 60000
      const localDate = new Date(parsedDate.getTime() - offset)
      
      return format(localDate, 'PPP')
    } catch (error) {
      console.error('Error formatting date:', error)
      return ''
    }
  }, [date])

  useEffect(() => {
    let mounted = true

    const updateFormattedDate = () => {
      if (mounted) {
        setFormattedDate(formatDate())
      }
    }

    const timeoutId = setTimeout(updateFormattedDate, 0)

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [formatDate])

  if (!formattedDate) {
    return (
      <time dateTime={date} className={className}>
        {date || 'Loading...'}
      </time>
    )
  }

  return (
    <time dateTime={date} className={className}>
      {formattedDate}
    </time>
  )
}
