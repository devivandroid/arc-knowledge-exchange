import { RiskIntelligenceClient } from "../../lib/sdk/risk-intelligence";

const baseUrl = process.env.RISK_API_BASE_URL ?? "https://kx-platform.fly.dev";
const sellerWallet =
  process.env.SELLER_WALLET ?? "0x8e0a1111111111111111111111111111111125be";

const client = new RiskIntelligenceClient({ baseUrl });

const guard = await client.evaluateTransactionRisk(sellerWallet, {
  maxRiskScore: 40,
  allowedRiskTiers: ["Low", "Medium"],
  minimumConfidenceLevel: "Medium",
  allowUnknownParticipantType: false,
  unknownWalletBehavior: "review"
});

if (guard.decision === "allow") {
  console.log("Continue with payment flow.", guard.reason);
} else if (guard.decision === "review") {
  console.log("Ask for human confirmation or additional verification before paying.", guard.reason);
} else {
  console.log("Do not proceed with this transaction.", guard.reason);
}

if (guard.profileStatus === "no_data") {
  console.log("No KX activity was found. No data is not high risk.");
}

console.log({
  sellerWallet,
  profileStatus: guard.profileStatus,
  decision: guard.decision,
  checks: guard.checks
});
