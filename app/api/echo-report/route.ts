import { NextResponse } from "next/server";
import { buildEchoReport } from "@/lib/data/echoReport";

export async function GET() {
  return NextResponse.json(buildEchoReport());
}