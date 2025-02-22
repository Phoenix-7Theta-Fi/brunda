"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function ChartDescription({ description }: { description: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-green-600/80 hover:bg-green-500 hover:text-white rounded-full"
        >
          <FileText className="h-4 w-4 text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="text-sm">{description}</p>
      </PopoverContent>
    </Popover>
  )
}
