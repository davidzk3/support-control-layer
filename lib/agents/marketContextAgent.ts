export function marketContextAgent(category: string) {
  if (category === "market_resolution") {
    return {
      lifecycle_stage: "resolution",
      insight: "Possible ambiguity in resolution criteria or source hierarchy",
      relevance: "high"
    };
  }

  if (category === "trading_platform_issue") {
    return {
      lifecycle_stage: "live_trading",
      insight: "Possible execution failure during active trading",
      relevance: "high"
    };
  }

  return {
    lifecycle_stage: "unknown",
    insight: "No strong market context",
    relevance: "low"
  };
}