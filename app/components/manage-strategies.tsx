"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Settings } from "lucide-react"

type Strategy = {
  _id: string
  name: string
  createdAt: string
}

export default function ManageStrategies({ 
  onStrategiesUpdate 
}: { 
  onStrategiesUpdate: () => void 
}) {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [newStrategy, setNewStrategy] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchStrategies = async () => {
    try {
      const response = await fetch("/api/strategy-types")
      const data = await response.json()
      if (response.ok) {
        setStrategies(data)
      } else {
        setError("Failed to load strategies")
      }
    } catch (error) {
      setError("Failed to load strategies")
    }
  }

  useEffect(() => {
    fetchStrategies()
  }, [])

  const handleAddStrategy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStrategy.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/strategy-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStrategy.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setNewStrategy("")
        fetchStrategies()
        onStrategiesUpdate()
      } else {
        setError(data.error || "Failed to add strategy")
      }
    } catch (error) {
      setError("Failed to add strategy")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteStrategy = async (id: string) => {
    if (!confirm("Are you sure you want to delete this strategy type?")) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/strategy-types?id=${id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        fetchStrategies()
        onStrategiesUpdate()
      } else {
        setError(data.error || "Failed to delete strategy")
      }
    } catch (error) {
      setError("Failed to delete strategy")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-10">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Strategy Types</DialogTitle>
          <DialogDescription>
            Add or remove strategy types for your charts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleAddStrategy} className="flex gap-2">
            <Input
              placeholder="New strategy type..."
              value={newStrategy}
              onChange={(e) => setNewStrategy(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              Add
            </Button>
          </form>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="space-y-2">
            {strategies.map((strategy) => (
              <div
                key={strategy._id}
                className="flex items-center justify-between p-2 rounded-md bg-muted"
              >
                <span>{strategy.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteStrategy(strategy._id)}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
