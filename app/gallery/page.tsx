'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { startOfDay, endOfDay } from "date-fns"
import DateFormatter from "@/app/components/date-formatter"
import DatePicker from "@/app/components/date-picker"
import ChartTags from "@/app/components/chart-tags"
import DeleteChart from "@/app/gallery/delete-chart"
import ChartDescription from "@/app/gallery/chart-description"
import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { LayoutGrid, Columns, Table2 } from "lucide-react"

const layoutOptions = [
  { value: "compact", label: "Compact", icon: LayoutGrid },
  { value: "standard", label: "Standard", icon: LayoutGrid },
  { value: "comfortable", label: "Comfortable", icon: Columns },
  { value: "list", label: "List", icon: Table2 }
] as const

const layoutClasses = {
  compact: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  standard: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  comfortable: "grid-cols-1 md:grid-cols-2",
  list: "grid-cols-1 max-w-4xl mx-auto"
} as const

const strategyTypes = [
  "All",
  "Trend Following",
  "Mean Reversion",
  "Breakout Trading",
  "Momentum Trading",
  "Counter-Trend",
  "Support/Resistance",
  "Gap Trading",
  "Price Action",
  "Volume-Based",
  "Moving Average Strategy"
] as const

interface Chart {
  _id: string;
  id: string;
  date: string;
  image: string;
  description: string;
  strategyType: string;
  executed: boolean;
}

async function getCharts(
  date?: Date, 
  dateRange?: { from: Date; to: Date },
  executionStatus?: string,
  strategyType?: string
): Promise<Chart[]> {
  const params = new URLSearchParams()
  
  if (dateRange) {
    const start = startOfDay(dateRange.from)
    const end = endOfDay(dateRange.to)
    params.append('start', start.toISOString())
    params.append('end', end.toISOString())
  } else if (date) {
    let start = startOfDay(date)
    let end = endOfDay(date)
    
    // If it's today's date, use current time as end
    const isToday = start.getDate() === new Date().getDate() &&
                    start.getMonth() === new Date().getMonth() &&
                    start.getFullYear() === new Date().getFullYear()
    
    if (isToday) {
      end = new Date()
    }
    
    params.append('start', start.toISOString())
    params.append('end', end.toISOString())
  }

  if (executionStatus && executionStatus !== 'all') {
    params.append('executed', executionStatus === 'executed' ? 'true' : 'false')
  }

  if (strategyType && strategyType !== 'all') {
    params.append('strategyType', strategyType)
  }

  const url = `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/charts${params.toString() ? `?${params.toString()}` : ''}`
  
  const res = await fetch(url, { 
    cache: 'no-store',
    next: { revalidate: 0 }
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch charts')
  }
  
  const { charts } = await res.json()
  return charts
}

export default function GalleryPage() {
  const [date, setDate] = useState<Date | undefined>()
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>()
  const [charts, setCharts] = useState<Chart[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [executionFilter, setExecutionFilter] = useState<string>('all')
  const [strategyFilter, setStrategyFilter] = useState<string>('all')
  const [layout, setLayout] = useState<keyof typeof layoutClasses>('standard')

  useEffect(() => {
    fetchCharts(undefined)
  }, [])

  const fetchCharts = async (
    selectedDate?: Date, 
    selectedRange?: { from: Date; to: Date }, 
    selectedExecutionStatus?: string,
    selectedStrategyType?: string
  ) => {
    try {
      setIsLoading(true)
      const charts = await getCharts(selectedDate, selectedRange, selectedExecutionStatus, selectedStrategyType)
      setCharts(charts)
    } catch (error) {
      console.error('Error fetching charts:', error)
      setCharts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (selectedDate?: Date, selectedRange?: { from: Date; to: Date }) => {
    setDate(selectedDate)
    setDateRange(selectedRange)
    fetchCharts(selectedDate, selectedRange, executionFilter, strategyFilter)
  }

  const handleExecutionFilterChange = (value: string) => {
    setExecutionFilter(value)
    fetchCharts(date, dateRange, value, strategyFilter)
  }

  const handleStrategyFilterChange = (value: string) => {
    setStrategyFilter(value)
    fetchCharts(date, dateRange, executionFilter, value)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-start gap-4 mb-8">
        <h1 className="text-2xl font-bold">Stock Charts Gallery</h1>
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <DatePicker 
            date={date} 
            dateRange={dateRange} 
            onSelect={handleDateSelect} 
          />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col gap-2">
              <Label>Execution Status</Label>
              <RadioGroup
                value={executionFilter}
                onValueChange={handleExecutionFilterChange}
                className="flex flex-row gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all">All</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="executed" id="executed" />
                  <Label htmlFor="executed">Executed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-executed" id="not-executed" />
                  <Label htmlFor="not-executed">Not Executed</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Strategy Type</Label>
              <select
                value={strategyFilter}
                onChange={(e) => handleStrategyFilterChange(e.target.value)}
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {strategyTypes.map((strategy) => (
                  <option key={strategy} value={strategy === 'All' ? 'all' : strategy}>
                    {strategy}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Layout</Label>
              <RadioGroup
                value={layout}
                onValueChange={(value) => setLayout(value as keyof typeof layoutClasses)}
                className="flex flex-row gap-4"
              >
                {layoutOptions.map(({ value, label, icon: Icon }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={value} />
                    <Label htmlFor={value} className="flex items-center gap-1">
                      <Icon className="h-4 w-4" />
                      <span className="hidden md:inline">{label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
      <div className={`grid gap-6 ${layoutClasses[layout]} transition-all duration-300`}>
        {isLoading ? (
          <div className="col-span-full text-center py-10">Loading...</div>
        ) : charts?.length === 0 ? (
          <div className="col-span-full text-center py-10">No images found for the selected filters</div>
        ) : (
          charts.map((chart) => (
            <Card key={chart._id}>
              <CardHeader className="relative">
                <div className="absolute right-2 top-0 flex gap-2">
                  <ChartDescription description={chart.description} />
                  <DeleteChart id={chart._id.toString()} />
                </div>
                <div>
                  <CardTitle className="text-sm text-muted-foreground">
                    <DateFormatter date={chart.date} />
                  </CardTitle>
                  <ChartTags 
                    strategyType={chart.strategyType}
                    executed={chart.executed}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`relative ${layout === 'list' ? 'aspect-[2/1]' : 'aspect-video'} group`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <a href={`/api/images/${chart._id}`} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`/api/images/${chart._id}`}
                      alt="Stock chart"
                      className="w-full h-full object-cover rounded-md hover:opacity-80 transition-opacity"
                    />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
