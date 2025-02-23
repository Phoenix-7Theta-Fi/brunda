import clientPromise from "@/lib/mongodb"

async function createIndexes() {
  try {
    console.log('Connecting to MongoDB...')
    const client = await clientPromise
    const db = client.db("stock-charts")
    const collection = db.collection("charts")

    console.log('Creating indexes...')

    // Create an index on the date field for range queries
    await collection.createIndex({ date: 1 }, {
      name: "date_index",
      background: true
    })

    // Create a compound index for filtered queries
    await collection.createIndex(
      { date: 1, strategyType: 1, executed: 1 },
      {
        name: "date_strategy_executed_index",
        background: true
      }
    )

    console.log('Indexes created successfully')
    
    // Verify indexes
    const indexes = await collection.indexes()
    console.log('Current indexes:', indexes)

    process.exit(0)
  } catch (error) {
    console.error('Error creating indexes:', error)
    process.exit(1)
  }
}

createIndexes()
