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

    console.log('Start Date:', start)
    console.log('End Date:', end)
    
    // Build the complete query first
    let query: any = {}
    
    const executed = searchParams.get('executed')
    if (executed !== null) {
      query.executed = executed === 'true'
    }

    const strategyType = searchParams.get('strategyType')
    if (strategyType && strategyType !== 'all') {
      query.strategyType = strategyType
    }

    // Add date range last to ensure it's not overwritten
    if (start && end) {
      // Convert to UTC dates for MongoDB query
      const startDate = new Date(start)
      const endDate = new Date(end)

      // Log the dates for debugging
      console.log({
        inputStart: start,
        inputEnd: end,
        parsedStart: startDate,
        parsedEnd: endDate,
        startISO: startDate.toISOString(),
        endISO: endDate.toISOString(),
        startUTC: startDate.toUTCString(),
        endUTC: endDate.toUTCString()
      })
      
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }

    console.log('Final Query:', JSON.stringify(query, null, 2))

    // Add query to explain the query plan
    const queryPlan = await collection.find(query).explain()
    console.log('Query Plan:', JSON.stringify(queryPlan, null, 2))

    const charts = await collection
      .find(query)
      .sort({ date: -1 })
      .toArray()

    console.log('Found charts:', charts.length)
    console.log('First chart:', charts[0])

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
