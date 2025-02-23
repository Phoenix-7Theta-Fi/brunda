import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { imageUrl, strategyType, executed, description, date } = body

    if (!imageUrl || !strategyType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("stock-charts")
    const collection = db.collection("charts")

    // Parse and store dates in UTC
    const parsedDate = new Date(date)
    console.log({
      incomingDate: date,
      parsedDate: parsedDate,
      parsedISO: parsedDate.toISOString(),
      parsedUTC: parsedDate.toUTCString()
    })

    // Ensure date is a valid Date object
    if (!(parsedDate instanceof Date && !isNaN(parsedDate.getTime()))) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    const result = await collection.insertOne({
      image: imageUrl,
      date: new Date(parsedDate),
      strategyType,
      executed,
      description: description || null,
      createdAt: new Date(),
    })

    // Log the inserted document
    const insertedDoc = await collection.findOne({ _id: result.insertedId })
    console.log('Inserted document:', insertedDoc)

    return NextResponse.json({ 
      success: true, 
      id: result.insertedId.toString() 
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload chart" },
      { status: 500 }
    )
  }
}
