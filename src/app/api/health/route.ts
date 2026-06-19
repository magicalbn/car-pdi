import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/mongoose";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ configured: isDbConfigured() });
}
