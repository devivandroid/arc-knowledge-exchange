import { RiskIntelligenceClient, type RiskSummaryResponse } from "../../lib/sdk/risk-intelligence";

const baseUrl = process.env.RISK_API_BASE_URL ?? "https://kx-platform.fly.dev";
const wallet =
  process.env.RISK_WALLET ?? "0x8e0a1111111111111111111111111111111125be";

function decide(summary: RiskSummaryResponse["summary"]): "allow" | "review" | "block" {
  if (summary.riskTier === "High") return "block";
  if (summary.riskTier === "Medium" || summary.confidenceLevel === "Low") return "review";
  return "allow";
}

const client = new RiskIntelligenceClient({ baseUrl });
const response = await client.getSummary(wallet);
const decision = decide(response.summary);

console.log({
  wallet: response.wallet,
  riskTier: response.summary.riskTier,
  confidenceLevel: response.summary.confidenceLevel,
  decision
});
