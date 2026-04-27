"use client";

import { useEffect, useState } from "react";
import { sampleTickets } from "@/lib/data/sampleTickets";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [echo, setEcho] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [override, setOverride] = useState<any>(null);
  const [sessionResults, setSessionResults] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/echo-report")
      .then((res) => res.json())
      .then((data) => setEcho(data));
  }, []);

  const analyze = async () => {
    setLoading(true);

    const res = await fetch("/api/analyze-ticket", {
      method: "POST",
      body: JSON.stringify({ text: input }),
    });

    const data = await res.json();
    setResult(data);
    setSessionResults((prev) => [...prev, data]);
    setOverride(null);
    setLoading(false);
  };

  const sessionEcho = buildSessionEchoReport(sessionResults);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-2">
          <p className="text-sm text-slate-400">CX Support Intelligence</p>
          <h1 className="text-3xl font-bold">Support Control Layer</h1>
          <p className="text-slate-300 max-w-4xl">
            A human-in-the-loop support orchestration layer for high-volume,
            high-stakes environments. It standardizes ticket classification,
            retrieves policy context, routes escalation, prepares response drafts,
            and turns support volume into operational signals.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Ticket Lab</h2>
              <p className="text-sm text-slate-400 mt-1 italic">
                Paste a support ticket or customer question below. You can also use
                one of the six prefilled scenarios to test the current support
                coverage model.
              </p>
            </div>

            <textarea
              className="w-full min-h-40 rounded-xl bg-slate-950 border border-slate-700 p-4 text-slate-100"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a support ticket here..."
            />

            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Prefilled scenarios
              </p>
              <div className="flex gap-2 flex-wrap">
                {sampleTickets.map((t) => (
                  <button
                    key={t.id}
                    className="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm"
                    onClick={() => setInput(t.text)}
                  >
                    {t.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-500">
              Early MVP note: the current model is trained around trading,
              resolution, deposits, account review, access restrictions, and
              escalation workflows. Inputs outside that scope are routed to manual
              review instead of being over-interpreted.
            </div>

            <button
              onClick={analyze}
              disabled={loading || !input}
              className="bg-white disabled:bg-slate-600 disabled:text-slate-400 text-slate-950 px-5 py-3 rounded-xl font-semibold"
            >
              {loading ? "Analyzing..." : "Analyze Ticket"}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-xl font-semibold">Agent Orchestration</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                "Intake Agent",
                "Tagging Model",
                "Policy RAG Agent",
                "Market Context Agent",
                "Escalation Agent",
                "Response Draft Agent",
                "Human Review",
              ].map((agent, idx) => (
                <div
                  key={agent}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                >
                  <span>{agent}</span>
                  <span className="text-xs text-slate-500">
                    Step {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {result && (
          <>
            {result.tags.primary_category === "out_of_scope" && (
              <section className="bg-amber-950/40 border border-amber-800 rounded-2xl p-5">
                <h2 className="text-lg font-semibold text-amber-100">
                  Outside Current Coverage
                </h2>
                <p className="text-sm text-amber-200 mt-2">
                  This input does not map cleanly to the current support taxonomy
                  or knowledge base. The system routed it to manual review rather
                  than forcing a low-confidence answer.
                </p>
              </section>
            )}

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-xl font-semibold mb-4">Agent Trace</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.agent_trace.map((step: any, index: number) => (
                  <div
                    key={`${step.agent}-${index}`}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{step.agent}</p>
                      <span className="text-xs bg-emerald-900 text-emerald-200 px-2 py-1 rounded-full">
                        {step.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{step.output}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title="Structured Tags">
                <KeyValue label="Extraction" value={result.tags.extraction_mode} />
                <KeyValue label="Category" value={result.tags.primary_category} />
                <KeyValue
                  label="Secondary"
                  value={result.tags.secondary_category || "none"}
                />
                <KeyValue label="Priority" value={result.tags.priority} />
                <KeyValue label="Escalation" value={result.tags.escalation_team} />

                <div className="mt-3">
                  <p className="text-slate-500 text-xs mb-1">Risk flags</p>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.risk_flags.map((flag: string) => (
                      <span
                        key={flag}
                        className="text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded-full"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>

              <Card title="Confidence Score">
                <div className="space-y-3">
                  <div className="text-4xl font-bold">
                    {Math.round(result.confidence.score * 100)}%
                  </div>
                  <div className="text-sm text-slate-400">
                    Level: {result.confidence.level}
                  </div>
                  <p className="text-slate-300">
                    {result.confidence.explanation}
                  </p>
                </div>
              </Card>

              <Card title="Policy RAG">
                <div className="space-y-3">
                  <p className="text-slate-300">
                    {result.policy.synthesized_policy}
                  </p>

                  <div className="text-xs text-slate-500">
                    <p className="mb-1">Sources:</p>
                    {result.policy.matched_sources.map((s: any) => (
                      <div key={s.source}>
                        • {s.title} ({s.origin}) — confidence {s.confidence}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card title="Market Context">
                <pre>{JSON.stringify(result.market, null, 2)}</pre>
              </Card>

              <Card title="Escalation">
                <pre>{JSON.stringify(result.escalation, null, 2)}</pre>
              </Card>

              <Card title="Human Review">
                <div className="space-y-3">
                  <pre>{JSON.stringify(result.human_review, null, 2)}</pre>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        setOverride({
                          action: "accepted_suggested_output",
                          note: "Support specialist accepted the suggested tags and escalation path.",
                        })
                      }
                      className="bg-emerald-900 text-emerald-100 px-3 py-2 rounded-lg text-xs"
                    >
                      Accept Suggested Output
                    </button>

                    <button
                      onClick={() =>
                        setOverride({
                          action: "priority_upgraded",
                          note: "Human upgraded priority based on financial loss, live trading impact, or sensitivity.",
                        })
                      }
                      className="bg-amber-900 text-amber-100 px-3 py-2 rounded-lg text-xs"
                    >
                      Override Priority
                    </button>

                    <button
                      onClick={() =>
                        setOverride({
                          action: "needs_manager_review",
                          note: "Ticket requires CX lead or manager review before response.",
                        })
                      }
                      className="bg-red-900 text-red-100 px-3 py-2 rounded-lg text-xs"
                    >
                      Escalate Review
                    </button>
                  </div>

                  {override && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                      <p className="text-xs text-slate-500 mb-1">
                        Human feedback signal
                      </p>
                      <pre>{JSON.stringify(override, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </Card>

              <Card title="Customer Draft">
                <p className="whitespace-pre-wrap text-slate-300">
                  {result.response}
                </p>
              </Card>

              <div className="lg:col-span-3">
                <Card title="Classification Evidence">
                  <pre>{JSON.stringify(result.model_extraction, null, 2)}</pre>
                </Card>
              </div>
            </section>
          </>
        )}

        {sessionEcho && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div>
              <h2 className="text-xl font-semibold">CX Echo Report</h2>
              <p className="text-slate-400 text-sm italic">
                This report updates as tickets are analyzed in the current browser session. In production,
                session data would be persisted and aggregated across channels,
                queues, and support teams so reporting reflects the full
                support stack.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Metric label="Session Tickets" value={sessionEcho.total_sample_tickets} />
              <Metric label="Top Signal" value={sessionEcho.top_signal} />
              <Metric
                label="P1 Issues"
                value={sessionEcho.priority_distribution.P1 || 0}
              />
              <Metric
                label="Human Review"
                value={sessionEcho.ai_quality_loop.expected_human_review_rate}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title="Category Distribution">
                <pre>
                  {JSON.stringify(sessionEcho.category_distribution, null, 2)}
                </pre>
              </Card>

              <Card title="Escalation Distribution">
                <pre>
                  {JSON.stringify(sessionEcho.escalation_distribution, null, 2)}
                </pre>
              </Card>

              <Card title="Risk Flags">
                <pre>
                  {JSON.stringify(sessionEcho.risk_flag_distribution, null, 2)}
                </pre>
              </Card>
            </div>

            <Card title="Market and Support Clusters">
              <div className="space-y-4">
                {sessionEcho.clusters.map((cluster: any) => (
                  <div
                    key={cluster.cluster}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4"
                  >
                    <div className="flex justify-between gap-4">
                      <p className="font-semibold">{cluster.cluster}</p>
                      <span className="text-xs text-slate-500">
                        {cluster.ticket_count} ticket(s)
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 mt-2">
                      {cluster.product_signal}
                    </p>

                    <p className="text-xs text-slate-500 mt-2">
                      Tickets: {cluster.ticket_ids.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Product Overview">
              <p className="text-slate-300 mb-5">
                {sessionEcho.product_overview}
              </p>

              <h3 className="font-semibold mb-2 text-slate-100">
                System Capabilities
              </h3>
<ul className="list-disc pl-5 space-y-1 text-slate-400 mb-5">
  {sessionEcho.system_capabilities.map((a: string) => (
    <li key={a}>{a}</li>
  ))}
</ul>

<h3 className="font-semibold mb-3 text-slate-100">
  Priority Reference
</h3>

<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
  <PriorityBadge
    level="P0"
    title="Critical"
    description="System-wide incident, funds risk, major outage, or urgent compliance exposure."
    className="border-red-800 bg-red-950/40 text-red-100"
  />

  <PriorityBadge
    level="P1"
    title="High"
    description="Serious user-impacting issue requiring urgent review, such as failed trading, settlement mismatch, or financial loss claim."
    className="border-orange-800 bg-orange-950/40 text-orange-100"
  />

  <PriorityBadge
    level="P2"
    title="Standard Review"
    description="Important but contained issue, such as account review, access restriction, or recoverable deposit path."
    className="border-amber-800 bg-amber-950/40 text-amber-100"
  />

  <PriorityBadge
    level="P3"
    title="Low / Manual Triage"
    description="General question, unclear input, or issue outside current coverage requiring manual routing."
    className="border-slate-700 bg-slate-950 text-slate-300"
  />
</div>
            </Card>
          </section>
        )}
      </div>
    </main>
  );
}

function buildSessionEchoReport(results: any[]) {
  const byCategory: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const byTeam: Record<string, number> = {};
  const riskFlags: Record<string, number> = {};

  for (const result of results) {
    const category = result.tags.primary_category;
    const priority = result.tags.priority;
    const team = result.tags.escalation_team;

    byCategory[category] = (byCategory[category] || 0) + 1;
    byPriority[priority] = (byPriority[priority] || 0) + 1;
    byTeam[team] = (byTeam[team] || 0) + 1;

    for (const flag of result.tags.risk_flags || []) {
      riskFlags[flag] = (riskFlags[flag] || 0) + 1;
    }
  }

  const topSignal =
  results.length > 0
    ? Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "unknown"
    : "No session data yet";

  return {
    total_sample_tickets: results.length,
    category_distribution: byCategory,
    priority_distribution: byPriority,
    escalation_distribution: byTeam,
    risk_flag_distribution: riskFlags,
    top_signal: topSignal,
    clusters: buildSessionClusters(results),
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

function buildSessionClusters(results: any[]) {
  const clusterMap: Record<
    string,
    {
      cluster: string;
      ticket_count: number;
      ticket_ids: string[];
      product_signal: string;
    }
  > = {};

  const getCluster = (category: string) => {
    if (category === "trading_platform_issue") {
      return {
        cluster: "Live trading execution issues",
        product_signal:
          "Group failed buy or sell reports by market, timestamp, device, and error pattern.",
      };
    }

    if (category === "market_resolution") {
      return {
        cluster: "Market resolution and settlement confusion",
        product_signal:
          "Route repeated settlement or Oracle mismatch reports into Market Ops review.",
      };
    }

    if (category === "deposit_issue") {
      return {
        cluster: "Funds recovery and deposit mistakes",
        product_signal:
          "Improve deposit education, token warnings, and recovery path visibility.",
      };
    }

    if (category === "account_issue") {
      return {
        cluster: "Trust and safety account reviews",
        product_signal:
          "Track restriction appeals and human override rate to calibrate review quality.",
      };
    }

    if (category === "geo_issue") {
      return {
        cluster: "Compliance and access restrictions",
        product_signal:
          "Monitor access confusion and ensure agents avoid unsafe workaround advice.",
      };
    }

    return {
      cluster: "Manual review and out-of-scope inputs",
      product_signal:
        "Review whether repeated out-of-scope tickets require new taxonomy, policy, or knowledge base coverage.",
    };
  };

  results.forEach((result, index) => {
    const clusterInfo = getCluster(result.tags.primary_category);
    const key = clusterInfo.cluster;

    if (!clusterMap[key]) {
      clusterMap[key] = {
        cluster: key,
        ticket_count: 0,
        ticket_ids: [],
        product_signal: clusterInfo.product_signal,
      };
    }

    clusterMap[key].ticket_count += 1;
    clusterMap[key].ticket_ids.push(`session_ticket_${index + 1}`);
  });

  return Object.values(clusterMap);
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-auto">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="text-sm text-slate-300">{children}</div>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b border-slate-800 py-2 gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-200">{String(value)}</span>
    </div>
  );
}

function PriorityBadge({
  level,
  title,
  description,
  className,
}: {
  level: string;
  title: string;
  description: string;
  className: string;
}) {
  return (
    <div className={`border rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-bold">{level}</span>
        <span className="text-xs opacity-80">{title}</span>
      </div>
      <p className="text-xs leading-relaxed opacity-90">{description}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold mt-1">{String(value)}</p>
    </div>
  );
}