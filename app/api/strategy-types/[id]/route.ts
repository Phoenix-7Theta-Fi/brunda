import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: "Strategy ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("stock-charts");
    const collection = db.collection("strategy-types");
    
    const strategy = await collection.findOne({ 
      _id: new ObjectId(id)
    });

    if (!strategy) {
      return NextResponse.json(
        { error: "Strategy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(strategy);
  } catch (error) {
    console.error("Error fetching strategy:", error);
    return NextResponse.json(
      { error: "Failed to fetch strategy" },
      { status: 500 }
    );
  }
}
