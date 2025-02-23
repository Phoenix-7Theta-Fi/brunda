import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env')
}

async function createIndexes() {
  try {
    console.log('Connecting to MongoDB...')
    const client = await MongoClient.connect(MONGODB_URI)
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

    await client.close()
    process.exit(0)
  } catch (error) {
    console.error('Error creating indexes:', error)
    process.exit(1)
  }
}

createIndexes()
