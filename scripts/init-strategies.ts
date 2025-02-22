import { config } from 'dotenv'
config() // Load environment variables from .env file

import clientPromise from "../lib/mongodb"

const defaultStrategies = [
  "Trend Following",
  "Mean Reversion",
  "Breakout Trading",
  "Momentum Trading",
  "Counter-Trend",
  "Support/Resistance",
  "Gap Trading",
  "Price Action",
  "Volume-Based",
  "Moving Average Strategy"
]

async function initializeStrategies() {
  try {
    const client = await clientPromise
    const db = client.db("stock-charts")
    const collection = db.collection("strategy-types")

    // Delete existing strategies
    await collection.deleteMany({})

    // Insert default strategies
    const strategies = defaultStrategies.map(name => ({
      name,
      createdAt: new Date()
    }))

    const result = await collection.insertMany(strategies)
    console.log(`Successfully initialized ${result.insertedCount} strategies`)

  } catch (error) {
    console.error("Error initializing strategies:", error)
  } finally {
    process.exit()
  }
}

initializeStrategies()
