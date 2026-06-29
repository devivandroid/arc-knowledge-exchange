# Deployment Diagram

This diagram shows the runtime architecture for the current MVP and planned storage layers.
The deployed app runs on Fly.io, serves the Next.js application over HTTPS, and interacts with Arc
Testnet through wallet and API flows.

```mermaid
flowchart TB
  browser["Browser"]
  wallet["MetaMask"]

  subgraph fly["Fly.io"]
    nextApp["Next.js App"]
    apiRoutes["Next.js API Routes"]
    riskEngine["Risk Intelligence Engine"]
  end

  postgres["PostgreSQL"]
  ipfs["IPFS"]
  arc["Arc Testnet"]
  usdc["USDC"]

  browser -->|"HTTPS"| nextApp
  browser -->|"wallet connection"| wallet
  nextApp -->|"REST JSON"| apiRoutes
  apiRoutes -->|"in-process calls"| riskEngine
  riskEngine -->|"risk events and network snapshots"| postgres
  apiRoutes -. "planned resource and delivery storage" .-> ipfs
  wallet -->|"signed transactions"| arc
  apiRoutes -->|"transaction receipt verification"| arc
  arc -->|"USDC settlement"| usdc
```

## Components

- **Browser**: user or agent operator interface.
- **MetaMask**: wallet used for Arc Testnet interaction and USDC transactions.
- **Fly.io**: hosting platform for the Next.js runtime.
- **Next.js App**: App Router frontend rendered by the deployed application.
- **Next.js API Routes**: REST JSON endpoints for resources, requests, Agent API and Risk Intelligence.
- **Risk Intelligence Engine**: server-side risk profile and Risk Guard logic.
- **PostgreSQL**: durable database for marketplace records, request drafts, receipts, ratings, risk events and network snapshots.
- **IPFS**: planned durable storage for resource payloads and delivery artifacts.
- **Arc Testnet**: EVM-compatible network for transaction proofs and settlement.
- **USDC**: payment asset used across marketplace and protected transaction workflows.
