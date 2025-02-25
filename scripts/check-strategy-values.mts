import { config } from 'dotenv';
import { MongoClient, Collection } from 'mongodb';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

interface StrategyType {
  _id: string;
  name: string;
}

interface Chart {
  _id: string;
  strategyType: string;
}

async function checkStrategyValues() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db("stock-charts");
    
    // Check strategy-types collection
    const strategyTypesCollection: Collection<StrategyType> = db.collection("strategy-types");
    const strategies = await strategyTypesCollection.find({}).toArray();
    console.log('\nStrategy Types Collection:');
    strategies.forEach((s: StrategyType) => console.log(`- ${s.name}`));
    
    // Check unique strategy types in charts collection
    const chartsCollection: Collection<Chart> = db.collection("charts");
    const uniqueStrategyTypes = await chartsCollection.distinct('strategyType');
    console.log('\nUnique Strategy Types in Charts:');
    uniqueStrategyTypes.forEach((s: string) => console.log(`- ${s}`));
    
    // Find any mismatches
    const strategyNames = new Set(strategies.map((s: StrategyType) => s.name));
    const mismatches = uniqueStrategyTypes.filter((s: string) => !strategyNames.has(s));
    if (mismatches.length > 0) {
      console.log('\nMismatches Found (strategies in charts but not in strategy-types):');
      mismatches.forEach((s: string) => console.log(`- ${s}`));
    }

    await client.close();
  } catch (error) {
    console.error("Error checking strategy values:", error);
  }
}

checkStrategyValues();
