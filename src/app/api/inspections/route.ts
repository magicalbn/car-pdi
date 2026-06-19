import { NextResponse } from "next/server";
import { connectDB, isDbConfigured } from "@/lib/db/mongoose";
import { InspectionModel } from "@/lib/db/models";
import type { Inspection } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ configured: false, inspections: [] });
  }
  await connectDB();
  const docs = await InspectionModel.find().sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ configured: true, inspections: docs });
}

export async function POST(req: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ persisted: false });
  }
  const body = (await req.json()) as Inspection;
  await connectDB();
  const { id, ...rest } = body;
  await InspectionModel.updateOne(
    { _id: id },
    { $set: rest, $setOnInsert: { _id: id } },
    { upsert: true }
  );
  return NextResponse.json({ persisted: true, id });
}
