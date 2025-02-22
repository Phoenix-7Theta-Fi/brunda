import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET all strategy types
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("stock-charts");
    const collection = db.collection("strategy-types");
    
    const strategies = await collection.find({}).sort({ name: 1 }).toArray();
    
    return NextResponse.json(strategies);
  } catch (error) {
    console.error("Error fetching strategy types:", error);
    return NextResponse.json(
      { error: "Failed to fetch strategy types" },
      { status: 500 }
    );
  }
}

// POST new strategy type
export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    
    if (!name) {
      return NextResponse.json(
        { error: "Strategy name is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("stock-charts");
    const collection = db.collection("strategy-types");
    
    // Check if strategy already exists
    const existing = await collection.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existing) {
      return NextResponse.json(
        { error: "Strategy type already exists" },
        { status: 400 }
      );
    }

    const result = await collection.insertOne({
      name,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      name,
    });
  } catch (error) {
    console.error("Error creating strategy type:", error);
    return NextResponse.json(
      { error: "Failed to create strategy type" },
      { status: 500 }
    );
  }
}

// DELETE strategy type
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Strategy ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("stock-charts");
    const collection = db.collection("strategy-types");
    
    // Check if strategy is in use
    const chartsCollection = db.collection("charts");
    const inUse = await chartsCollection.findOne({ 
      strategyType: id 
    });

    if (inUse) {
      return NextResponse.json(
        { error: "Cannot delete strategy type that is in use" },
        { status: 400 }
      );
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Strategy type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting strategy type:", error);
    return NextResponse.json(
      { error: "Failed to delete strategy type" },
      { status: 500 }
    );
  }
}
