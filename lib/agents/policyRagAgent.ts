type RagSource = {
  title: string;
  source: string;
  origin: "internal_policy" | "public_polymarket_docs";
  content: string;
};

type RagResult = {
  matched_sources: {
    title: string;
    source: string;
    origin: string;
    confidence: number;
  }[];
  synthesized_policy: string;
  confidence: number;
};

const knowledgeBase: Record<string, RagSource[]> = {
  trading_platform_issue: [
    {
      title: "Stuck Position Escalation",
      source: "kb/internal/stuck_position_escalation.md",
      origin: "internal_policy",
      content:
        "Failed trading actions during live markets should be treated as time sensitive. Collect market URL, timestamp, account, screenshots, and error details. Do not promise refunds."
    }
  ],

  market_resolution: [
    {
      title: "Market Resolution Playbook",
      source: "kb/internal/market_resolution_playbook.md",
      origin: "internal_policy",
      content:
        "Support should not make final resolution judgments. Escalate if Oracle resolution and platform state differ."
    },
    {
      title: "Polymarket Resolution Docs",
      source: "kb/public/polymarket_resolution.md",
      origin: "public_polymarket_docs",
      content:
        "Markets may end in real-world time but remain open until settlement is finalized. Resolution depends on predefined criteria and trusted sources."
    }
  ],

  deposit_issue: [
    {
      title: "Unsupported Token Policy",
      source: "kb/internal/unsupported_token_deposit.md",
      origin: "internal_policy",
      content:
        "Recovery depends on wallet type and token. Do not guarantee recovery."
    },
    {
      title: "Polymarket Deposit Docs",
      source: "kb/public/polymarket_deposits.md",
      origin: "public_polymarket_docs",
      content:
        "Sending unsupported tokens may result in permanent loss. Confirm token and network before sending."
    }
  ],

  account_issue: [
    {
      title: "Account Restriction Policy",
      source: "kb/internal/account_restriction_policy.md",
      origin: "internal_policy",
      content:
        "Do not disclose internal detection logic. Escalate to Trust and Safety."
    },
    {
      title: "Polymarket Account Policy",
      source: "kb/public/polymarket_accounts.md",
      origin: "public_polymarket_docs",
      content:
        "Accounts may be restricted due to suspicious activity. Additional review may be required."
    }
  ],

  geo_issue: [
    {
      title: "Geo Restriction Policy",
      source: "kb/internal/geo_restriction_policy.md",
      origin: "internal_policy",
      content:
        "Do not advise VPN usage or bypassing restrictions."
    }
  ]
};

export function policyRagAgent(category: string): RagResult {
  const sources = knowledgeBase[category] || [];

  if (sources.length === 0) {
    return {
      matched_sources: [],
      synthesized_policy:
        "No direct match found. Use general support guidelines and escalate if necessary.",
      confidence: 0.4
    };
  }

  const matched_sources = sources.map((s) => ({
    title: s.title,
    source: s.source,
    origin: s.origin,
    confidence: s.origin === "internal_policy" ? 0.9 : 0.75
  }));

  const synthesized_policy = sources
    .map((s) => s.content)
    .join(" ");

  return {
    matched_sources,
    synthesized_policy,
    confidence: 0.85
  };
}