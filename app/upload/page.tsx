"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImagePlus } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import UploadDatePicker from "@/app/components/upload-date-picker"
import ManageStrategies from "@/app/components/manage-strategies"

type Strategy = {
  _id: string
  name: string
  createdAt: string
}

export default function UploadPage() {
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [selectedStrategy, setSelectedStrategy] = useState("")
  const [executed, setExecuted] = useState<boolean>(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const fetchStrategies = async () => {
    try {
      const response = await fetch("/api/strategy-types")
      const data = await response.json()
      if (response.ok) {
        setStrategies(data)
      }
    } catch (error) {
      console.error("Error fetching strategies:", error)
    }
  }

  useEffect(() => {
    fetchStrategies()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !selectedStrategy || !selectedDate) {
      alert("Please select a file, strategy type, and date")
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('strategyType', selectedStrategy)
      formData.append('executed', executed.toString())
      formData.append('date', selectedDate?.toISOString() || new Date().toISOString())
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
      setSelectedStrategy("")
      setExecuted(false)
      setSelectedFile(null)
      setSelectedDate(undefined)
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
              <div className="flex items-center justify-between">
                <Label htmlFor="strategyType">Strategy Type</Label>
                <ManageStrategies onStrategiesUpdate={fetchStrategies} />
              </div>
              <select
                id="strategyType"
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              >
                <option value="">Select a strategy type</option>
                {strategies.map((strategy) => (
                  <option key={strategy._id} value={strategy._id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Chart Date</Label>
              <div className="mt-2">
                <UploadDatePicker 
                  date={selectedDate} 
                  onSelect={setSelectedDate}
                />
              </div>
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
