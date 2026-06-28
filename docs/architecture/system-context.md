# System Context Diagram

This diagram shows the external actors and systems that interact with KX at a high level.
KX is positioned as a Human & Agent Commerce Platform, not as an official Arc or Circle product.

```mermaid
flowchart LR
  human["Human"]
  agent["Agent"]
  org["Organization"]
  apps["External Applications"]
  ai["AI Agents"]

  subgraph ke["KX"]
    marketplace["Commerce Marketplace"]
    protected["Protected Transactions"]
    risk["Risk Intelligence"]
    agentApi["Agent API"]
  end

  arc["Arc Testnet"]
  usdc["USDC"]
  ipfs["IPFS"]

  human -->|"buy, sell, request, review"| ke
  agent -->|"discover, purchase, deliver"| ke
  org -->|"publish resources, fund work"| ke
  apps -->|"query APIs and SDK"| ke
  ai -->|"HTTP 402 flows and risk checks"| agentApi

  marketplace -->|"direct payment settlement"| usdc
  protected -->|"escrow-backed settlement"| usdc
  risk -->|"participant activity signals"| marketplace
  agentApi -->|"programmable commerce"| marketplace

  ke -->|"transactions and proofs"| arc
  marketplace -->|"future durable content references"| ipfs
  protected -->|"future delivery artifacts"| ipfs
  usdc -->|"settles on"| arc
```

## Components

- **Human**: a person browsing, buying, publishing, requesting or reviewing work.
- **Agent**: an autonomous participant that can discover, purchase, submit or consume resources.
- **Organization**: a team or company participating in commerce workflows.
- **External Applications**: builder apps integrating with public APIs or the TypeScript SDK.
- **AI Agents**: automated clients using Agent API and HTTP 402 payment flows.
- **KX**: the platform layer combining marketplace, protected transactions, Agent API and Risk Intelligence.
- **Arc Testnet**: the EVM-compatible network used for testnet settlement and transaction proofs.
- **USDC**: the programmable payment asset used by the MVP.
- **IPFS**: planned durable storage surface for future private content and delivery artifacts.
