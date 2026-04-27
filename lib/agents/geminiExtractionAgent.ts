import { GoogleGenAI, Type } from "@google/genai";

export type GeminiStructuredExtraction = {
  issue_summary: string;
  primary_category:
    | "trading_platform_issue"
    | "market_resolution"
    | "deposit_issue"
    | "account_issue"
    | "geo_issue"
    | "unknown";
  secondary_category: string;
  priority: "P0" | "P1" | "P2" | "P3";
  support_domain: string;
  user_sentiment: "calm" | "confused" | "frustrated" | "angry" | "urgent";
  risk_flags: string[];
  escalation_team:
    | "CX"
    | "Engineering"
    | "Market Ops"
    | "Trust and Safety"
    | "Payments"
    | "Compliance";
  requires_human_review: boolean;
  reasoning: string;
};

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function geminiExtractionAgent(
  ticketText: string
): Promise<GeminiStructuredExtraction | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are a senior crypto support operations analyst.

Extract structured support intelligence from the ticket.

Use ONLY these primary_category values:
- trading_platform_issue
- market_resolution
- deposit_issue
- account_issue
- geo_issue
- unknown

Routing rules:
- Failed buy, sell, close, order execution, stuck live position → trading_platform_issue
- Oracle, UMA, resolution, settlement, resolved wrong, redeem issue → market_resolution
- USDC, USDT, deposit, wrong token, transaction hash → deposit_issue
- restricted, banned, suspicious activity, account review → account_issue
- VPN, country, region, access restriction → geo_issue

Safety rules:
- Never promise refunds.
- Never advise VPN usage.
- Never disclose abuse detection logic.
- Escalate trading execution, financial loss, resolution disputes, account restrictions, unsupported token deposits, and compliance sensitive issues.

Ticket:
${ticketText}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issue_summary: { type: Type.STRING },
            primary_category: {
              type: Type.STRING,
              enum: [
                "trading_platform_issue",
                "market_resolution",
                "deposit_issue",
                "account_issue",
                "geo_issue",
                "unknown",
              ],
            },
            secondary_category: { type: Type.STRING },
            priority: {
              type: Type.STRING,
              enum: ["P0", "P1", "P2", "P3"],
            },
            support_domain: { type: Type.STRING },
            user_sentiment: {
              type: Type.STRING,
              enum: ["calm", "confused", "frustrated", "angry", "urgent"],
            },
            risk_flags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            escalation_team: {
              type: Type.STRING,
              enum: [
                "CX",
                "Engineering",
                "Market Ops",
                "Trust and Safety",
                "Payments",
                "Compliance",
              ],
            },
            requires_human_review: { type: Type.BOOLEAN },
            reasoning: { type: Type.STRING },
          },
          required: [
            "issue_summary",
            "primary_category",
            "secondary_category",
            "priority",
            "support_domain",
            "user_sentiment",
            "risk_flags",
            "escalation_team",
            "requires_human_review",
            "reasoning",
          ],
        },
      },
    });

    const text = response.text;
    return JSON.parse(text || "{}") as GeminiStructuredExtraction;
  } catch (error) {
    console.error("Structured extraction failed:", error);
    return null;
  }
}