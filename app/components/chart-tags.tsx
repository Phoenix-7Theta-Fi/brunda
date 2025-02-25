import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface ChartTagsProps {
  strategyType: string;
  executed: boolean;
  marketCap?: "small" | "large";
}

interface StrategyType {
  _id: string;
  name: string;
}

export default function ChartTags({ strategyType, executed, marketCap }: ChartTagsProps) {
  const [strategyName, setStrategyName] = useState<string>(strategyType)
  
  useEffect(() => {
    const fetchStrategyName = async () => {
      try {
        // Check if strategyType is an ID by attempting to fetch it
        const res = await fetch(`/api/strategy-types/${strategyType}`)
        if (res.ok) {
          const data: StrategyType = await res.json()
          setStrategyName(data.name)
        }
      } catch (error) {
        console.error('Error fetching strategy name:', error)
        // Keep the original strategy type value if fetch fails
      }
    }

    // Only fetch if it looks like an ID (e.g., MongoDB ObjectId format)
    if (/^[0-9a-fA-F]{24}$/.test(strategyType)) {
      fetchStrategyName()
    }
  }, [strategyType])

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Badge className="bg-gray-100 text-gray-800">{strategyName}</Badge>
      {executed ? (
        <Badge className="bg-red-100 text-red-800">Executed</Badge>
      ) : (
        <Badge className="bg-blue-100 text-blue-800">Not Executed</Badge>
      )}
      {marketCap && (
        <Badge className={marketCap === "small" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}>
          {marketCap === "small" ? "Small Cap" : "Large Cap"}
        </Badge>
      )}
    </div>
  )
}
