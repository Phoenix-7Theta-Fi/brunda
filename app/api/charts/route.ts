import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { UTApi } from "uploadthing/server"

export async function GET(req: Request) {
  try {
    const client = await clientPromise
    const db = client.db("stock-charts")
    const collection = db.collection("charts")

    const { searchParams } = new URL(req.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const stockName = searchParams.get('stockName')

    console.log('Start Date:', start)
    console.log('End Date:', end)
    console.log('Stock Name:', stockName)
    
    // Build the complete query first
    let query: any = {}

    if (stockName) {
      query.stockName = { $regex: new RegExp(stockName, 'i') } // Case-insensitive search
    }
    
    const executed = searchParams.get('executed')
    if (executed !== null) {
      query.executed = executed === 'true'
    }

    const marketCap = searchParams.get('marketCap')
    if (marketCap && marketCap !== 'all') {
      query.marketCap = marketCap
    }

    const strategyType = searchParams.get('strategyType')
    if (strategyType && strategyType !== 'all') {
      // First try to find the strategy type by name
      const strategyTypesCollection = db.collection("strategy-types")
      const strategy = await strategyTypesCollection.findOne({ 
        name: { $regex: new RegExp(`^${strategyType}$`, 'i') }
      })
      
      if (strategy) {
        // If found, search by ID
        query.strategyType = strategy._id.toString()
      } else {
        // If not found, try direct match (fallback)
        query.strategyType = strategyType
      }
      
      console.log('Strategy type query:', {
        searchedFor: strategyType,
        strategyFound: strategy ? 'yes' : 'no',
        queryValue: query.strategyType
      })
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

    const charts = await collection
      .find(query)
      .sort({ date: -1 })
      .toArray()

    console.log('Found charts:', charts.length)
    if (charts.length > 0) {
      console.log('Strategy Types in results:', charts.map(c => c.strategyType))
      console.log('First chart:', {
        id: charts[0]._id,
        strategyType: charts[0].strategyType,
        stockName: charts[0].stockName,
        marketCap: charts[0].marketCap
      })
    }

    return NextResponse.json({ charts })
  } catch (error) {
    console.error("Fetch charts error:", error)
    return NextResponse.json(
      { error: "Failed to fetch charts" },
      { status: 500 }
    )
  }
}

const utapi = new UTApi();

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

    // First get the chart to get the image URLs
    const chart = await collection.findOne({ _id: new ObjectId(id) })
    console.log("Found chart:", chart)
    
    if (!chart) {
      return NextResponse.json(
        { error: "Chart not found" },
        { status: 404 }
      )
    }

    // Delete from Uploadthing if there are images
    if (chart.images && Array.isArray(chart.images)) {
      try {
        for (const imageUrl of chart.images) {
          console.log("Processing image URL:", imageUrl)
          
          // Extract fileKey from the URL (format: https://uploadthing.com/f/fileKey)
          const fileKey = imageUrl.split('/f/')[1]
          if (!fileKey) {
            console.error("Invalid image URL format:", imageUrl)
            continue // Skip this image but continue with others
          }
          
          console.log("Extracted fileKey:", fileKey)

          // Attempt to delete the file from Uploadthing
          try {
            const deleteResult = await utapi.deleteFiles(fileKey)
            console.log(`Deletion result for ${fileKey}:`, deleteResult)
            
            if (!deleteResult.success) {
              console.error(`Failed to delete file ${fileKey} from Uploadthing:`, deleteResult)
            }
          } catch (singleDeleteError) {
            console.error(`Error deleting file ${fileKey}:`, singleDeleteError)
            // Continue with other images even if one fails
          }
        }
      } catch (uploadthingError) {
        console.error("Uploadthing deletion error:", uploadthingError)
        // Continue with MongoDB deletion even if Uploadthing deletion fails
        console.log("Continuing with MongoDB deletion despite Uploadthing error")
      }
    } else {
      console.log("No images found in chart data")
    }

    // Then delete from MongoDB
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete chart from database" },
        { status: 500 }
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
