import { NextResponse } from "next/server";
import { connectDB, isDbConfigured } from "@/lib/db/mongoose";
import { InspectionModel } from "@/lib/db/models";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isDbConfigured()) return NextResponse.json({ configured: false });
  await connectDB();
  const doc = await InspectionModel.findById(id).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ inspection: doc });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!isDbConfigured()) return NextResponse.json({ persisted: false });
  await connectDB();
  await InspectionModel.deleteOne({ _id: id });
  return NextResponse.json({ persisted: true });
}
