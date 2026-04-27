import { intakeAgent } from "./intakeAgent";
import {
  classifyTicket,
  isLikelySupportTicket,
} from "../taxonomy/supportTaxonomy";
import { marketContextAgent } from "./marketContextAgent";
import { policyRagAgent } from "./policyRagAgent";
import { escalationAgent } from "./escalationAgent";
import { responseAgent } from "./responseAgent";
import { geminiExtractionAgent } from "./geminiExtractionAgent";

function computeConfidence(args: {
  modelExtraction: any;
  policySourceCount: number;
  priority: string;
  riskFlags: string[];
  marketRelevance: string;
}) {
  let score = 0.55;

  if (args.modelExtraction) score += 0.2;
  if (args.policySourceCount > 0) score += 0.1;
  if (args.policySourceCount > 1) score += 0.05;
  if (args.riskFlags.length > 0) score += 0.05;
  if (args.marketRelevance === "high") score += 0.05;

  if (args.priority === "P0" || args.priority === "P1") {
    score -= 0.05;
  }

  return Math.max(0.1, Math.min(0.95, Number(score.toFixed(2))));
}

export async function analyzeTicket(text: string) {
  if (!isLikelySupportTicket(text)) {
    return {
      agent_trace: [
        {
          agent: "Scope Check",
          status: "review",
          output:
            "The input does not match the current support coverage model.",
        },
        {
          agent: "Human Review",
          status: "required",
          output:
            "A support specialist should review this manually or expand the taxonomy if this becomes a repeated theme.",
        },
      ],
      intake: {
        summary: text.slice(0, 140),
        sentiment: "neutral",
        market_related: false,
        funds_related: false,
      },
      tags: {
        primary_category: "out_of_scope",
        secondary_category: "insufficient_context",
        priority: "P3",
        escalation_team: "CX",
        risk_flags: ["needs_manual_review"],
        support_domain: "unknown",
        user_sentiment: "neutral",
        requires_human_review: true,
        extraction_mode: "scope_guard",
      },
      policy: {
        matched_sources: [],
        synthesized_policy:
          "This MVP currently covers support tickets involving trading, deposits, withdrawals, market resolution, account review, access restrictions, positive feedback, and related escalation workflows.",
        confidence: 0.35,
      },
      market: {
        lifecycle_stage: "unknown",
        insight: "No market lifecycle context available for this input.",
        relevance: "low",
      },
      escalation: {
        escalation_team: "CX",
        escalation_reason:
          "The input is outside the current model scope and should be manually reviewed if relevant.",
        required_fields: [
          "clear issue description",
          "account, market, or transaction context if applicable",
        ],
        sla_recommendation: "standard",
        handling: "manual_triage",
      },
      response:
        "This looks outside the current support coverage model. This MVP is focused on tickets involving trading, deposits, withdrawals, market resolution, account review, access restrictions, positive feedback, and related escalation workflows.",
      confidence: {
        score: 0.35,
        level: "low",
        explanation:
          "Low confidence because the input does not match the current support taxonomy or knowledge base coverage.",
      },
      model_extraction: {
        issue_summary: text.slice(0, 140),
        primary_category: "out_of_scope",
        secondary_category: "insufficient_context",
        priority: "P3",
        support_domain: "unknown",
        user_sentiment: "neutral",
        risk_flags: ["needs_manual_review"],
        escalation_team: "CX",
        requires_human_review: true,
        reasoning:
          "The system could not confidently map this input to the current support taxonomy.",
      },
      human_review: {
        status: "required",
        reason: "Input is outside current support coverage.",
        suggested_action:
          "Manually review the question or expand the knowledge base and taxonomy if this becomes a repeated support pattern.",
      },
    };
  }

  const intake = intakeAgent(text);
  const deterministicTags = classifyTicket(text);
  const modelExtraction = await geminiExtractionAgent(text);

const finalCategory =
  modelExtraction?.primary_category || deterministicTags.primary_category;

const tags = modelExtraction
  ? {
      primary_category: finalCategory,
      secondary_category:
        modelExtraction.secondary_category ||
        deterministicTags.secondary_category ||
        "unspecified",
      priority: modelExtraction.priority || deterministicTags.priority,
      escalation_team:
        modelExtraction.escalation_team ||
        deterministicTags.escalation_team,
      risk_flags:
        modelExtraction.risk_flags && modelExtraction.risk_flags.length > 0
          ? modelExtraction.risk_flags
          : deterministicTags.risk_flags,
      support_domain:
        modelExtraction.support_domain || "general_support",
      user_sentiment:
        modelExtraction.user_sentiment || intake.sentiment,
      requires_human_review: finalCategory !== "positive_feedback",
      model_reasoning: modelExtraction?.reasoning,
      extraction_mode: "standardized_classification",
    }
    : {
        ...deterministicTags,
        support_domain: "general_support",
        user_sentiment: intake.sentiment,
        requires_human_review:
          deterministicTags.primary_category !== "positive_feedback",
        extraction_mode: "deterministic_fallback",
      };

  const policy = policyRagAgent(tags.primary_category);
  const market = marketContextAgent(tags.primary_category);
  const escalation = escalationAgent(tags.primary_category, tags.priority);
  const response = responseAgent(tags.primary_category);
  const isSignalOnly = tags.primary_category === "positive_feedback";

  const confidenceScore = computeConfidence({
    modelExtraction,
    policySourceCount: policy.matched_sources.length,
    priority: tags.priority,
    riskFlags: tags.risk_flags || [],
    marketRelevance: market.relevance,
  });

  return {
    agent_trace: [
      {
        agent: "Intake Agent",
        status: "complete",
        output: `Detected ${
          intake.market_related ? "market-related" : "non-market"
        } ticket with sentiment "${intake.sentiment}".`,
      },
      {
        agent: "Tagging Model",
        status: "complete",
        output:
          tags.extraction_mode === "standardized_classification"
            ? "Applied structured classification with deterministic taxonomy safeguards."
            : "Used deterministic taxonomy because the model layer did not return a structured response.",
      },
      {
        agent: "Policy RAG Agent",
        status: "complete",
        output: `Matched ${
          policy.matched_sources.length
        } source(s): ${policy.matched_sources
          .map((s: any) => s.title)
          .join(", ")}`,
      },
      {
        agent: "Market Context Agent",
        status: "complete",
        output:
          market.relevance === "high"
            ? `High relevance to market lifecycle (${market.lifecycle_stage}).`
            : "Low market lifecycle relevance.",
      },
      {
        agent: "Escalation Agent",
        status: "complete",
        output: isSignalOnly
          ? "Logged to CX Analytics. No operational escalation required."
          : `Routed to ${escalation.escalation_team} with ${escalation.sla_recommendation} priority.`,
      },
      {
        agent: "Response Draft Agent",
        status: isSignalOnly ? "skipped" : "complete",
        output: isSignalOnly
          ? "No response draft generated because this is signal-only feedback."
          : "Prepared a policy-aligned draft for human review.",
      },
      {
        agent: isSignalOnly ? "CX Analytics" : "Human Review",
        status: isSignalOnly ? "logged" : "required",
        output: isSignalOnly
          ? "Captured as sentiment and product quality signal. No support action required."
          : tags.priority === "P1" || tags.priority === "P0"
          ? "High priority issue requires validation before sending."
          : "Recommended review before sending.",
      },
    ],
    intake,
    tags,
    model_extraction: modelExtraction || {
      issue_summary: intake.summary,
      primary_category: tags.primary_category,
      secondary_category: tags.secondary_category,
      priority: tags.priority,
      support_domain: tags.support_domain,
      user_sentiment: tags.user_sentiment,
      risk_flags: tags.risk_flags,
      escalation_team: tags.escalation_team,
      requires_human_review: tags.requires_human_review,
      reasoning: isSignalOnly
        ? "Positive feedback was classified as signal-only CX analytics input."
        : "Baseline classification path used because the live model layer did not return a structured response.",
    },
    policy,
    market,
    escalation,
    response,
    confidence: {
      score: isSignalOnly ? 0.9 : confidenceScore,
      level: isSignalOnly
        ? "high"
        : confidenceScore >= 0.8
        ? "high"
        : confidenceScore >= 0.6
        ? "medium"
        : "low",
      explanation: isSignalOnly
        ? "High confidence because the input was classified as positive feedback and does not require operational escalation."
        : "Confidence is based on model extraction availability, matched policy sources, risk flag clarity, and market lifecycle relevance.",
    },
    human_review: isSignalOnly
      ? {
          status: "not_required",
          reason:
            "Positive feedback is treated as CX analytics signal, not operational support work.",
          suggested_action:
            "Log for sentiment tracking, NPS analysis, and product quality reporting. No customer response required.",
        }
      : {
          status: "required",
          reason:
            tags.priority === "P1" || tags.priority === "P0"
              ? "High priority issue requires human validation before response"
              : "Human review recommended before final customer reply",
          suggested_action:
            "Review tags, confirm escalation path, verify required evidence, then send or edit response.",
        },
  };
}