# Component Diagram

This is the main engineering view of KX. It shows how product surfaces, public APIs,
the Risk Intelligence Engine, SDK consumers and infrastructure fit together.

```mermaid
flowchart TB
  subgraph web["KX Web Application"]
    marketplace["Marketplace"]
    requests["Requests"]
    protected["Protected Transactions"]
    activity["My Activity"]
    agentApi["Agent API"]
  end

  subgraph risk["Risk Intelligence Engine"]
    data["Data Sources"]
    features["Feature Layer"]
    scoring["Risk Scoring"]
    signals["Behavioral Signals"]
    guard["Risk Guard"]
  end

  publicApis["Public Risk Intelligence APIs"]
  sdk["KX TypeScript SDK"]
  sdkMethods["getProfile()\ngetSummary()\ngetSignals()\nevaluateTransactionRisk()\ncanTransactWith()\nisRiskAtOrBelow()\nisRiskBelow()\nisRiskAbove()\nhasRiskData()"]

  postgres["PostgreSQL"]
  ipfs["IPFS"]
  arc["Arc"]
  usdc["USDC"]

  marketplace -->|"resource views, purchases, downloads"| data
  requests -->|"request events and delivery events"| data
  protected -->|"funding and release events"| data
  activity -->|"participant history"| data
  agentApi -->|"HTTP 402 commerce events"| data

  data --> features
  features --> scoring
  features --> signals
  scoring --> guard
  signals --> guard

  risk --> publicApis
  publicApis --> sdk
  sdk --> sdkMethods

  protected -->|"settlement"| arc
  marketplace -->|"direct ERC-20 transfers"| usdc
  protected -->|"USDC escrow settlement"| usdc
  usdc --> arc

  data -. "future persistent event store" .-> postgres
  marketplace -. "future durable resource storage" .-> ipfs
  requests -. "future delivery artifacts" .-> ipfs
```

## Components

- **KX Web Application**: the user-facing Next.js application.
- **Marketplace**: commerce surface for resources, downloadable assets, APIs, services and knowledge packages.
- **Requests**: custom work opportunities between humans, agents and organizations.
- **Protected Transactions**: escrow-backed transaction flow for custom work.
- **My Activity**: participant activity and local transaction context.
- **Agent API**: HTTP 402 programmable commerce flow for autonomous clients.
- **Risk Intelligence Engine**: shared service layer that computes participant-aware risk profiles.
- **Data Sources**: current KX events, with planned external adapters.
- **Feature Layer**: normalized behavior metrics derived from events.
- **Risk Scoring**: preview scoring model for financial behavior, risk tier and confidence.
- **Behavioral Signals**: explainable signals such as activity recency and counterparty diversity.
- **Risk Guard**: pre-transaction policy evaluator returning allow, review or block.
- **Public Risk Intelligence APIs**: public REST endpoints under `/api/risk/*`.
- **KX TypeScript SDK**: internal reusable client for builders and agent workflows.
- **PostgreSQL**: planned persistent event and profile storage.
- **IPFS**: planned durable resource and delivery storage.
- **Arc**: EVM-compatible settlement network.
- **USDC**: programmable payment asset used for direct purchases and protected transactions.
