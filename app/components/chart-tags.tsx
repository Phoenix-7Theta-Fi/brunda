'use client'

import { Badge } from "@/components/ui/badge"
import { 
  BarChart2, 
  TrendingUp, 
  CheckCircle2, 
  XCircle 
} from "lucide-react"

interface ChartTagsProps {
  patternType: string
  strategyType: string
  executed: boolean
}

export default function ChartTags({
  patternType,
  strategyType,
  executed,
}: ChartTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="pattern">
        <BarChart2 className="w-3 h-3" />
        {patternType}
      </Badge>
      <Badge variant="strategy">
        <TrendingUp className="w-3 h-3" />
        {strategyType}
      </Badge>
      <Badge variant={executed ? "executed" : "notExecuted"}>
        {executed ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
        {executed ? "Executed" : "Not Executed"}
      </Badge>
    </div>
  )
}
