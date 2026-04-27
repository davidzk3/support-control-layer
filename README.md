# Support Control Layer

A support intelligence and routing system designed for high volume, high stakes environments such as trading platforms and prediction markets.

This system standardizes how support issues are classified, ensures consistent routing across internal teams, and preserves human review for sensitive cases. Instead of treating tickets as isolated events, it structures them into repeatable patterns that can be tracked across trading, resolution, deposits, account access, and compliance.

Over time, support volume becomes a signal for operational gaps, product issues, and risk exposure.

---

## What this demonstrates

This is not a chatbot or a support automation tool.

It is a **control layer** that sits between incoming support tickets and internal operations.

Core capabilities:

- Structured classification across category, priority, and risk flags
- Policy-aware routing to internal teams
- Market lifecycle context awareness
- Safe response drafting aligned with policy constraints
- Human-in-the-loop validation for high risk cases
- Aggregated reporting across sessions to surface systemic issues

---

## System Flow

Each ticket is processed through a structured support pipeline:

| Stage | Purpose |
|------|--------|
| Intake | Detect issue type, sentiment, and support relevance |
| Tagging Model | Classify category, priority, risk flags, and owner team |
| Policy Retrieval | Match the ticket against internal and public support guidance |
| Market Context | Assess lifecycle relevance across trading, resolution, and settlement |
| Escalation | Route the case to the correct internal team with required evidence |
| Response Draft | Prepare a safe, policy aligned customer reply |
| Human Review | Enforce review for sensitive or high risk cases |

---

## CX Echo Report

The system aggregates tickets into structured signals:

- Category distribution
- Escalation load by team
- Risk flag patterns
- Clustered issue types

This allows support activity to surface:

- execution failures during live trading
- unclear resolution or settlement logic
- deposit and recovery friction
- trust and safety pressure points

*In a production environment, this data would be persisted and aggregated across sessions, queues, regions, and support teams so reporting reflects the full support stack.*

---

## Local Development

```bash
npm install
npm run dev

Open the app locally:

http://localhost:3000