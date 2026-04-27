import { NextResponse } from "next/server";
import { analyzeTicket } from "@/lib/agents/orchestrator";

export async function POST(req: Request) {
  const { text } = await req.json();

  const result = await analyzeTicket(text);

  return NextResponse.json(result);
}