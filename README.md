# Support Control Layer

A support intelligence and routing system designed for high volume, high stakes environments such as trading platforms and prediction markets.

This system standardizes how support issues are classified, ensures consistent routing across internal teams, and preserves human review for sensitive cases. Instead of treating tickets as isolated events, it structures them into repeatable patterns that can be tracked across trading, resolution, deposits, account access, and compliance.

Over time, support volume becomes a signal for operational gaps, product issues, and risk exposure.

---

## What this demonstrates

This is not a chatbot or a support automation tool.

It is a **control layer** that sits between incoming support tickets and internal operations.

Core capabilities:

- Structured classification (category, priority, risk flags)
- Policy-aware routing to internal teams
- Market lifecycle context awareness
- Safe response drafting aligned with policy constraints
- Human-in-the-loop validation for high risk cases
- Aggregated reporting across sessions to surface systemic issues

---

## System Flow

Each ticket goes through a deterministic pipeline:

1. Intake → detect type and sentiment  
2. Tagging Model → classify category, priority, risk  
3. Policy Retrieval → match internal and public policies  
4. Market Context → assess lifecycle relevance  
5. Escalation → route to correct internal team  
6. Response Draft → generate safe, policy-aligned reply  
7. Human Review → required for sensitive cases  

---

## Example Use Cases

- Failed trades during live markets  
- Market resolution disputes  
- Deposit and recovery issues  
- Account access and restriction cases  
- Compliance and geo restriction questions  

---

## CX Echo Report

The system aggregates tickets into structured signals:

- Category distribution
- Escalation load by team
- Risk flag patterns
- Clustered issue types

This allows support activity to surface:

- execution failures
- unclear resolution logic
- UX gaps in deposits
- trust and safety pressure points

*In a production environment, this data would be persisted and aggregated across all sessions, queues, and regions.*

---

## Local Development

```bash
npm install
npm run dev

Open the app locally at: http://localhost:3000