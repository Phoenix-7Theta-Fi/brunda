import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    await client.db("admin").command({ ping: 1 })
    
    const db = client.db("stock-charts")
    const collections = await db.listCollections().toArray()
    
    return NextResponse.json({
      status: "Connected successfully to MongoDB!",
      collections: collections.map(col => col.name)
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      { 
        error: "Failed to connect to database",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
