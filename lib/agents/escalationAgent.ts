export function escalationAgent(category: string, priority: string) {
  if (category === "trading_platform_issue") {
    return {
      escalation_team: "Engineering",
      escalation_reason:
        "User reports failed trading action during live market movement with possible financial loss.",
      required_fields: [
        "market_url",
        "timestamp",
        "account_email_or_wallet",
        "error_message",
        "screenshots",
        "platform_used",
      ],
      sla_recommendation: "urgent",
    };
  }

  if (category === "market_resolution") {
    return {
      escalation_team: "Market Ops",
      escalation_reason:
        "User reports resolution, settlement, or Oracle state mismatch requiring market lifecycle review.",
      required_fields: [
        "market_url",
        "resolution_source",
        "oracle_status",
        "user_claim",
      ],
      sla_recommendation: priority === "P1" ? "urgent" : "standard",
    };
  }

  if (category === "deposit_issue") {
    return {
      escalation_team: "Payments",
      escalation_reason:
        "User sent unsupported or incorrect token and needs recovery assessment.",
      required_fields: [
        "transaction_hash",
        "wallet_address",
        "token_sent",
        "network",
        "login_type",
      ],
      sla_recommendation: "standard",
    };
  }

  if (category === "account_issue") {
    return {
      escalation_team: "Trust and Safety",
      escalation_reason:
        "User account restriction requires review without exposing internal detection rules.",
      required_fields: [
        "account_identifier",
        "wallet_address",
        "recent_activity_context",
      ],
      sla_recommendation: "standard",
    };
  }

  if (category === "geo_issue") {
    return {
      escalation_team: "Compliance",
      escalation_reason:
        "Access issue may involve location or eligibility restrictions.",
      required_fields: ["account_identifier", "current_region", "error_message"],
      sla_recommendation: "standard",
    };
  }

  return {
    escalation_team: "CX",
    escalation_reason: "No specialized escalation path detected.",
    required_fields: ["account_identifier", "issue_summary"],
    sla_recommendation: "standard",
  };
}