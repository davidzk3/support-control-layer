import { sampleTickets } from "./sampleTickets";
import { classifyTicket } from "../taxonomy/supportTaxonomy";

function buildClusters(analyzed: any[]) {
  const clusters = [
    {
      name: "Live trading execution issues",
      match: ["trading_platform_issue"],
      product_signal:
        "Group failed buy or sell reports by market, timestamp, device, and error pattern.",
    },
    {
      name: "Market resolution and settlement confusion",
      match: ["market_resolution"],
      product_signal:
        "Route repeated settlement or Oracle mismatch reports into Market Ops review.",
    },
    {
      name: "Funds recovery and deposit mistakes",
      match: ["deposit_issue"],
      product_signal:
        "Improve deposit education, token warnings, and recovery path visibility.",
    },
    {
      name: "Trust and safety account reviews",
      match: ["account_issue"],
      product_signal:
        "Track restriction appeals and human override rate to calibrate review quality.",
    },
    {
      name: "Compliance and access restrictions",
      match: ["geo_issue"],
      product_signal:
        "Monitor access confusion and ensure agents avoid unsafe workaround advice.",
    },
  ];

  return clusters
    .map((cluster) => {
      const tickets = analyzed.filter((item) =>
        cluster.match.includes(item.primary_category)
      );

      return {
        cluster: cluster.name,
        ticket_count: tickets.length,
        ticket_ids: tickets.map((t) => t.id),
        product_signal: cluster.product_signal,
      };
    })
    .filter((cluster) => cluster.ticket_count > 0);
}

export function buildEchoReport() {
  const analyzed = sampleTickets.map((ticket) => {
    const tags = classifyTicket(ticket.text);
    return {
      id: ticket.id,
      ...tags,
    };
  });

  const byCategory: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const byTeam: Record<string, number> = {};
  const riskFlags: Record<string, number> = {};

  for (const item of analyzed) {
    byCategory[item.primary_category] =
      (byCategory[item.primary_category] || 0) + 1;

    byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;

    byTeam[item.escalation_team] = (byTeam[item.escalation_team] || 0) + 1;

    for (const flag of item.risk_flags) {
      riskFlags[flag] = (riskFlags[flag] || 0) + 1;
    }
  }

  const clusters = buildClusters(analyzed);

  const topCategory =
    Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "unknown";

return {
  total_sample_tickets: analyzed.length,
  category_distribution: byCategory,
  priority_distribution: byPriority,
  escalation_distribution: byTeam,
  risk_flag_distribution: riskFlags,
  top_signal: topCategory,
  clusters,

  product_overview:
    "Support Control Layer is built for high-volume, high-stakes environments where consistency, routing accuracy, and policy alignment matter. The system standardizes how tickets are classified, ensures issues are routed to the correct internal owners, and preserves human review for sensitive cases. Instead of treating tickets as isolated events, it structures them into repeatable patterns across trading, resolution, deposits, account access, and compliance. Over time, this allows support volume to surface operational gaps and inform product, market operations, and risk decisions.",

  system_capabilities: [
    "Standardize ticket classification across categories, priority, and risk flags.",
    "Retrieve relevant policy context to guide safe and consistent responses.",
    "Route issues to the correct internal team with required evidence fields.",
    "Preserve human review for sensitive or high-risk cases before response.",
    "Track repeated patterns across tickets to surface operational signals.",
    "Capture human overrides as feedback to improve system consistency over time.",
  ],

  ai_quality_loop: {
    expected_human_review_rate: "100 percent for P0 and P1 issues",
    expected_override_tracking:
      "Track when support specialists change category, priority, escalation team, or customer draft.",
  },
};
}