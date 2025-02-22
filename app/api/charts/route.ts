import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: Request) {
  try {
    const client = await clientPromise
    const db = client.db("stock-charts")
    const collection = db.collection("charts")

    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    let query: any = {}
    if (start && end) {
      query.date = {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    }

    const executed = searchParams.get('executed')
    if (executed !== null) {
      query.executed = executed === 'true'
    }

    const strategyType = searchParams.get('strategyType')
    if (strategyType && strategyType !== 'all') {
      query.strategyType = strategyType
    }

    const charts = await collection
      .find(query)
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json({ charts })
  } catch (error) {
    console.error("Fetch charts error:", error)
    return NextResponse.json(
      { error: "Failed to fetch charts" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json(
        { error: "Chart ID is required" },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db("stock-charts")
    const collection = db.collection("charts")

    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Chart not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete chart error:", error)
    return NextResponse.json(
      { error: "Failed to delete chart" },
      { status: 500 }
    )
  }
}
