export const taxonomy = {
  trading_platform_issue: [
    "sell button failed",
    "cannot sell",
    "cannot buy",
    "stuck position",
    "failed order",
    "order failed",
    "trade failed",
    "unable to close",
    "position",
  ],
  market_resolution: [
    "resolved wrong",
    "resolution",
    "oracle",
    "uma",
    "settlement",
    "redeem",
    "market ended",
    "still open",
    "finalized",
  ],
  deposit_issue: [
    "sent",
    "deposit",
    "withdraw",
    "withdrawal",
    "usdc",
    "usdt",
    "wrong token",
    "transaction",
    "hash",
    "wallet",
  ],
  account_issue: [
    "restricted",
    "banned",
    "suspended",
    "account review",
    "suspicious",
    "locked",
  ],
  geo_issue: [
    "vpn",
    "country",
    "region",
    "traveling",
    "geoblocked",
    "geo",
    "jurisdiction",
  ],
};

function normalizeTicketText(text: string) {
  const typoMap: Record<string, string> = {
    // resolution / settlement
    resoluton: "resolution",
    reslution: "resolution",
    resoltion: "resolution",
    resolutoin: "resolution",
    settlemnt: "settlement",
    setlement: "settlement",
    settlment: "settlement",

    // trading
    postion: "position",
    positon: "position",
    posiiton: "position",
    sel: "sell",
    buuy: "buy",
    selled: "sold",

    // deposits / payments
    depoist: "deposit",
    deposite: "deposit",
    depost: "deposit",
    depsoit: "deposit",
    withdral: "withdrawal",
    withdrwal: "withdrawal",
    withraw: "withdraw",
    trasaction: "transaction",
    transction: "transaction",
    transaciton: "transaction",

    // wallet / crypto
    walet: "wallet",
    wallett: "wallet",
    walett: "wallet",

    // account / access
    accunt: "account",
    acount: "account",
    accont: "account",
    restriced: "restricted",
    resticted: "restricted",
    restrcted: "restricted",
    acces: "access",
    acess: "access",

    // support / intent
    suport: "support",
    supprt: "support",
    helpme: "help me",
    refnd: "refund",
    refun: "refund",
    refud: "refund",

    // market / oracle
    marcket: "market",
    mrket: "market",
    makret: "market",
    orcale: "oracle",
    oracel: "oracle",
  };

  let normalized = text.toLowerCase();

  Object.entries(typoMap).forEach(([wrong, correct]) => {
    const regex = new RegExp(`\\b${wrong}\\b`, "g");
    normalized = normalized.replace(regex, correct);
  });

  normalized = normalized
    .replace(/\s+/g, " ")
    .replace(/[^\w\s?.]/g, "")
    .trim();

  return normalized;
}

function levenshteinDistance(a: string, b: string) {
  const matrix = Array.from({ length: b.length + 1 }, () =>
    Array(a.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,
        matrix[j][i - 1] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}

function fuzzyKeywordMatch(text: string, keywords: string[]) {
  const words = text.split(/\s+/).filter(Boolean);

  return keywords.some((keyword) => {
    if (text.includes(keyword)) return true;

    const keywordWords = keyword.split(/\s+/);

    if (keywordWords.length > 1) {
      return keywordWords.every((kw) =>
        words.some((word) => {
          if (word.length < 4 || kw.length < 4) return false;
          return levenshteinDistance(word, kw) <= 2;
        })
      );
    }

    return words.some((word) => {
      if (word.length < 4 || keyword.length < 4) return false;
      return levenshteinDistance(word, keyword) <= 2;
    });
  });
}

export function isLikelySupportTicket(text: string) {
  const lower = normalizeTicketText(text);

  const supportSignals = [
    "account",
    "deposit",
    "withdraw",
    "withdrawal",
    "wallet",
    "market",
    "resolution",
    "resolved",
    "settlement",
    "trade",
    "sell",
    "buy",
    "position",
    "restricted",
    "banned",
    "vpn",
    "access",
    "usdc",
    "usdt",
    "transaction",
    "hash",
    "redeem",
    "oracle",
    "uma",
    "error",
    "failed",
    "support",
    "refund",
    "login",
    "locked",
    "suspicious",
    "token",
  ];

  return fuzzyKeywordMatch(lower, supportSignals);
}

export function classifyTicket(text: string) {
  const lower = normalizeTicketText(text);

  if (
    fuzzyKeywordMatch(lower, [
      "sell",
      "buy",
      "failed order",
      "order failed",
      "stuck position",
      "cannot close",
      "unable to close",
      "position",
      "trade failed",
      "sell button failed",
      "cannot sell",
      "cannot buy",
    ])
  ) {
    return {
      primary_category: "trading_platform_issue",
      secondary_category: "execution_or_position_issue",
      priority: "P1",
      escalation_team: "Engineering",
      risk_flags: ["live_trading_impact", "financial_loss"],
    };
  }

  if (
    fuzzyKeywordMatch(lower, [
      "resolved",
      "resolution",
      "oracle",
      "uma",
      "settlement",
      "redeem",
      "market ended",
      "still open",
      "finalized",
      "resolved wrong",
    ])
  ) {
    return {
      primary_category: "market_resolution",
      secondary_category: "resolution_or_settlement_issue",
      priority: "P1",
      escalation_team: "Market Ops",
      risk_flags: ["resolution_dispute"],
    };
  }

  if (
    fuzzyKeywordMatch(lower, [
      "usdt",
      "usdc",
      "wrong token",
      "deposit",
      "withdraw",
      "withdrawal",
      "transaction",
      "hash",
      "wallet",
      "sent",
    ])
  ) {
    return {
      primary_category: "deposit_issue",
      secondary_category: "deposit_or_recovery_issue",
      priority: "P2",
      escalation_team: "Payments",
      risk_flags: ["funds_recovery"],
    };
  }

  if (
    fuzzyKeywordMatch(lower, [
      "restricted",
      "banned",
      "suspended",
      "suspicious",
      "locked",
      "account review",
      "account",
    ])
  ) {
    return {
      primary_category: "account_issue",
      secondary_category: "account_review",
      priority: "P2",
      escalation_team: "Trust and Safety",
      risk_flags: ["account_review"],
    };
  }

  if (
    fuzzyKeywordMatch(lower, [
      "vpn",
      "traveling",
      "country",
      "region",
      "geoblocked",
      "jurisdiction",
      "access",
      "geo",
    ])
  ) {
    return {
      primary_category: "geo_issue",
      secondary_category: "access_restriction",
      priority: "P2",
      escalation_team: "Compliance",
      risk_flags: ["access_restriction"],
    };
  }

  return {
    primary_category: "unknown",
    secondary_category: "unclassified",
    priority: "P3",
    escalation_team: "CX",
    risk_flags: ["needs_manual_review"],
  };
}