'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { startOfDay, endOfDay } from "date-fns"
import DateFormatter from "@/app/components/date-formatter"
import DatePicker from "@/app/components/date-picker"
import ChartTags from "@/app/components/chart-tags"
import DeleteChart from "@/app/gallery/delete-chart"
import { useState, useEffect } from "react"

interface Chart {
  _id: string;
  id: string;
  date: string;
  image: string;
  description: string;
  patternType: string;
  strategyType: string;
  executed: boolean;
}

async function getCharts(date?: Date): Promise<Chart[]> {
  let url = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/charts`
  if (date) {
    const start = startOfDay(date).toISOString()
    const end = endOfDay(date).toISOString()
    url += `?start=${start}&end=${end}`
  }
  const res = await fetch(url, { cache: 'no-store' })
  
  if (!res.ok) {
    throw new Error('Failed to fetch charts')
  }
  
  const { charts } = await res.json()
  return charts
}

export default function GalleryPage() {
  const [date, setDate] = useState<Date | undefined>()
  const [charts, setCharts] = useState<Chart[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCharts(undefined)
  }, [])

  const fetchCharts = async (selectedDate?: Date) => {
    try {
      setIsLoading(true)
      const charts = await getCharts(selectedDate)
      setCharts(charts)
    } catch (error) {
      console.error('Error fetching charts:', error)
      setCharts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (selectedDate?: Date) => {
    setDate(selectedDate)
    fetchCharts(selectedDate)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-start gap-4 mb-8">
        <h1 className="text-2xl font-bold">Stock Charts Gallery</h1>
        <DatePicker date={date} onSelect={handleDateSelect} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-10">Loading...</div>
        ) : charts?.length === 0 ? (
          <div className="col-span-full text-center py-10">No images found for the selected date</div>
        ) : (
          charts.map((chart) => (
            <Card key={chart._id}>
            <CardHeader className="flex items-center justify-between space-x-4">
              <div className="flex flex-col space-y-2">
                <CardTitle className="text-sm text-muted-foreground">
                  <DateFormatter date={chart.date} />
                </CardTitle>
                <ChartTags 
                  patternType={chart.patternType}
                  strategyType={chart.strategyType}
                  executed={chart.executed}
                />
              </div>
              <DeleteChart id={chart._id.toString()} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={chart.image}
                  alt="Stock chart"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <p className="text-sm">{chart.description}</p>
            </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
