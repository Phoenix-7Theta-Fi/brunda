"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DeleteChart({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    try {
      setIsDeleting(true)
      
      const response = await fetch("/api/charts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete chart")
      }

      router.refresh()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete chart")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="hover:bg-destructive hover:text-destructive-foreground"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  )
}
