export function intakeAgent(text: string) {
  return {
    summary: text.slice(0, 120),
    sentiment: text.includes("lost") ? "frustrated" : "neutral",
    market_related: text.includes("market"),
    funds_related: text.includes("money") || text.includes("usdt")
  };
}