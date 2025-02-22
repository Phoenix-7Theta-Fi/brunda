"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImagePlus } from "lucide-react"
import { useState, useRef } from "react"

const patternTypes = [
  "Head and Shoulders",
  "Inverse Head and Shoulders",
  "Double Top",
  "Double Bottom",
  "Cup and Handle",
  "Triple Top",
  "Triple Bottom",
  "Rectangle Pattern",
  "Flag Pattern",
  "Pennant Pattern"
] as const

const strategyTypes = [
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

export default function UploadPage() {
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [patternType, setPatternType] = useState<typeof patternTypes[number]>(patternTypes[0])
  const [strategyType, setStrategyType] = useState<typeof strategyTypes[number]>(strategyTypes[0])
  const [executed, setExecuted] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !patternType || !strategyType) {
      alert("Please select a file, pattern type, and strategy type")
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('patternType', patternType)
      formData.append('strategyType', strategyType)
      formData.append('executed', executed.toString())
      if (description) {
        formData.append('description', description)
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to save chart")
      }

      // Reset form
      setDescription("")
      setPatternType(patternTypes[0])
      setStrategyType(strategyTypes[0])
      setExecuted(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      alert("Chart uploaded successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      alert("Error uploading chart")
    } finally {
      setUploading(false)
    }
  }
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Upload Stock Chart</CardTitle>
          <CardDescription>
            Upload your stock chart image with date and description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="image">Chart Image</Label>
              <div className="mt-2">
                <Input
                  ref={fileInputRef}
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="patternType">Pattern Type</Label>
              <select
                id="patternType"
                value={patternType}
                onChange={(e) => setPatternType(e.target.value as typeof patternTypes[number])}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              >
                {patternTypes.map((pattern) => (
                  <option key={pattern} value={pattern}>
                    {pattern}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="strategyType">Strategy Type</Label>
              <select
                id="strategyType"
                value={strategyType}
                onChange={(e) => setStrategyType(e.target.value as typeof strategyTypes[number])}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              >
                {strategyTypes.map((strategy) => (
                  <option key={strategy} value={strategy}>
                    {strategy}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Execution Status</Label>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="executed"
                    checked={executed}
                    onChange={() => setExecuted(true)}
                    className="mr-2"
                  />
                  <Label htmlFor="executed">Executed</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="notExecuted"
                    checked={!executed}
                    onChange={() => setExecuted(false)}
                    className="mr-2"
                  />
                  <Label htmlFor="notExecuted">Not Executed</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                className="mt-2"
                placeholder="Enter chart description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? "Uploading..." : "Save Chart"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
