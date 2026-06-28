import { RiskIntelligenceClient } from "../../lib/sdk/risk-intelligence";

const baseUrl = process.env.RISK_API_BASE_URL ?? "https://kx-platform.fly.dev";
const wallet =
  process.env.RISK_WALLET ?? "0x8e0a1111111111111111111111111111111125be";

const client = new RiskIntelligenceClient({ baseUrl });

const allowed = await client.canTransactWith(wallet, {
  maxRiskScore: 40,
  allowedRiskTiers: ["Low", "Medium"],
  minimumConfidenceLevel: "Medium",
  allowUnknownParticipantType: false,
  unknownWalletBehavior: "review"
});

console.log({
  wallet,
  allowed
});
