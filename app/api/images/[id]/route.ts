import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("stock-charts")
    const collection = db.collection("charts")

    const chart = await collection.findOne({ _id: new ObjectId(id) })

    if (!chart || !chart.image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      )
    }

    // Extract the content type and base64 data from the data URL
    const matches = chart.image.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      )
    }

    const [, contentType, base64Data] = matches
    const buffer = Buffer.from(base64Data, 'base64')

    // Return the image with proper headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error("Fetch image error:", error)
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    )
  }
}
