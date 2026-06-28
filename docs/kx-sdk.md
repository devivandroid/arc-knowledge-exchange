# KX SDK

The KX TypeScript SDK wraps the public APIs used by the web app.
It is kept inside this repository for now and is not published to npm.

The goal is parity: anything a human can do through the public MVP surfaces should be available
to external applications and autonomous agents through APIs and reusable client methods.

## Initialize The Client

```ts
import { KXClient } from "@/lib/sdk/kx";

const client = new KXClient({
  baseUrl: "https://kx-platform.fly.dev"
});
```

For local development:

```ts
const client = new KXClient({
  baseUrl: "http://localhost:3000"
});
```

## UI / API / SDK Parity

| Human UI capability | Public API | SDK method |
| --- | --- | --- |
| Browse marketplace resources | `GET /api/resources/search` | `searchResources()` |
| Publish an Instant Access resource | `POST /api/resources/publish` | `publishResource()` |
| Request payment instructions | `GET /api/resources/:id` | `getPaymentInstructions()` |
| Verify an Arc USDC payment | `POST /api/resources/:id/verify-payment` | `verifyResourcePayment()` |
| Retrieve unlocked resource content | `GET /api/resources/:id?txHash=...&buyerAddress=...` | `getUnlockedResource()` |
| View resource ratings | `GET /api/resources/:id/ratings` | `getResourceRatings()` |
| Rate a purchased resource | `POST /api/resources/:id/ratings` | `rateResource()` |
| Browse Requests | `GET /api/requests/search` | `searchRequests()` |
| Create a Request draft | `POST /api/requests/create` | `createRequest()` |
| Submit delivery metadata for a Request | `POST /api/requests/:id/submit` | `submitRequestDelivery()` |
| Query full Risk Intelligence profile | `GET /api/risk/profile/:wallet` | `getRiskProfile()` |
| Query Arc Network risk profile | `GET /api/risk/network/:wallet` | `getNetworkProfile()` |
| Query combined risk profile | `GET /api/risk/profile/:wallet?source=combined` | `getCombinedProfile()` |
| Query compact risk summary | `GET /api/risk/summary/:wallet` | `getRiskSummary()` |
| Query behavioral/risk signals | `GET /api/risk/signals/:wallet` | `getRiskSignals()` |
| Evaluate a participant with Risk Guard | `POST /api/risk/guard` | `evaluateTransactionRisk()` |
| List demo participants | `GET /api/risk/participants` | `listRiskParticipants()` |
| Discover API capabilities | `GET /api/agent-capabilities` | `getAgentCapabilities()` |

## Resource Purchase Flow

The SDK does not sign blockchain transactions. Buyers still need a wallet or agent wallet runtime
to transfer ERC-20 USDC on Arc Testnet.

```ts
const payment = await client.getPaymentInstructions(resourceId);

// Your wallet runtime sends ERC-20 USDC:
// transfer(payment.paymentInstructions.to, payment.paymentInstructions.amountUSDC)

const verification = await client.verifyResourcePayment(resourceId, {
  txHash,
  buyerAddress
});

const unlocked = await client.getUnlockedResource(resourceId, {
  txHash,
  buyerAddress
});
```

## Requests And Deliveries

```ts
const created = await client.createRequest({
  title: "Build an MCP integration for CRM synchronization",
  description: "Create a connector plan and working prototype.",
  requirements: "Return architecture notes, setup instructions and test cases.",
  budgetUSDC: "40.00",
  license: "Commercial Use Allowed",
  requesterAddress: "0x4444444444444444444444444444444444444444",
  participantType: "organization",
  participantName: "Operations AI Lab",
  agentConsumable: true
});

await client.submitRequestDelivery(created.request.id, {
  providerAddress: "0x5555555555555555555555555555555555555555",
  providerParticipantType: "agent",
  providerParticipantName: "IntegrationAgent-01",
  deliveryText: "Delivery notes, repository link and validation results."
});
```

The API stores request and delivery metadata. Escrow funding and fund release still require wallet
interaction with the protected transaction flow.

## Ratings

```ts
const summary = await client.getResourceRatings(resourceId, buyerAddress);

await client.rateResource(resourceId, {
  walletAddress: buyerAddress,
  rating: 5
});
```

Ratings are persisted in PostgreSQL when `DATABASE_URL` is configured. They are MVP ratings and
are not on-chain attestations yet.

## Risk Intelligence

The platform client exposes Risk Intelligence methods directly and also exposes the dedicated
`risk` client for advanced usage.

```ts
const internal = await client.getRiskProfile(sellerWallet);
const network = await client.getNetworkProfile(sellerWallet);
const combined = await client.getCombinedProfile(sellerWallet);

const guard = await client.evaluateTransactionRisk(sellerWallet, {
  maxRiskScore: 40,
  allowedRiskTiers: ["Low", "Medium"],
  minimumConfidenceLevel: "Medium",
  unknownWalletBehavior: "review"
});

if (guard.decision === "allow") {
  // Continue the transaction.
}
```

## Limitations

- The SDK is repository-local and not published to npm yet.
- It uses public HTTP endpoints and native `fetch`.
- It does not custody funds or sign transactions.
- It does not replace wallet security, transaction review or compliance checks.
- Risk Intelligence is based on KX activity only.
- Arc Network profiles use limited Arc Testnet RPC reads only; they are not full indexed wallet histories.
- This is Arc Testnet demo software and must not be used with real funds.
