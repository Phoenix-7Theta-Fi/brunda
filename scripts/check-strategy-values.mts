import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Collection, Document, MongoClient } from 'mongodb'

// Get the directory path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Load environment variables from the root directory's .env file
config({ path: path.join(rootDir, '.env') })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env')
}

interface StrategyType extends Document {
  name: string;
}

interface Chart extends Document {
  strategyType: string;
}

const run = async () => {
  console.log('Connecting to MongoDB...')
  const client = await MongoClient.connect(MONGODB_URI)
  
  try {
    const db = client.db("stock-charts")
    
    // Check strategy-types collection
    const strategyTypesCollection: Collection<StrategyType> = db.collection("strategy-types")
    const strategies = await strategyTypesCollection.find({}).toArray()
    console.log('\nStrategy Types Collection:')
    strategies.forEach(s => console.log(`- ${s.name}`))
    
    // Check unique strategy types in charts collection
    const chartsCollection: Collection<Chart> = db.collection("charts")
    const uniqueStrategyTypes = await chartsCollection.distinct('strategyType')
    console.log('\nUnique Strategy Types in Charts:')
    uniqueStrategyTypes.forEach(s => console.log(`- ${s}`))
    
    // Find any mismatches
    const strategyNames = new Set(strategies.map(s => s.name))
    const mismatches = uniqueStrategyTypes.filter(s => !strategyNames.has(s))
    if (mismatches.length > 0) {
      console.log('\nMismatches Found (strategies in charts but not in strategy-types):')
      mismatches.forEach(s => console.log(`- ${s}`))
    }

  } catch (error) {
    console.error("Error checking strategy values:", error)
    process.exit(1)
  } finally {
    await client.close()
    console.log('\nConnection closed')
  }
}

run()
