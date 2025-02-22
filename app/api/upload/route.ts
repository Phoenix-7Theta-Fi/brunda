import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const strategyType = formData.get('strategyType') as string
    const executed = formData.get('executed') === 'true'
    const description = formData.get('description') as string
    const date = new Date(formData.get('date') as string)

    if (!file || !strategyType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

    const client = await clientPromise
    const db = client.db("stock-charts")
    const collection = db.collection("charts")

    const result = await collection.insertOne({
      image: base64Image,
      date: date, // User selected date
      strategyType,
      executed,
      description: description || null, // Make description optional
      createdAt: new Date(),
    })

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
