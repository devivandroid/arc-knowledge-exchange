import { RiskIntelligenceClient } from "../../lib/sdk/risk-intelligence";

const baseUrl = process.env.RISK_API_BASE_URL ?? "https://kx-platform.fly.dev";
const sellerWallet =
  process.env.SELLER_WALLET ?? "0x8e0a1111111111111111111111111111111125be";

const client = new RiskIntelligenceClient({ baseUrl });
const [summary, signals] = await Promise.all([
  client.getSummary(sellerWallet),
  client.getSignals(sellerWallet)
]);

const hasNoData = summary.profileStatus === "no_data";
const shouldEscalate =
  hasNoData ||
  summary.summary.riskTier === "High" ||
  signals.riskSignals.some((signal) => signal.severity === "Elevated");

console.log({
  sellerWallet,
  participant: summary.participant,
  riskTier: summary.summary.riskTier,
  profileStatus: summary.profileStatus,
  confidenceLevel: summary.summary.confidenceLevel,
  agentDecision: shouldEscalate ? "route_to_human_review" : "proceed_with_payment_flow",
  reason: shouldEscalate
    ? hasNoData
      ? "No KX activity was found. No data is not high risk, but review is safer before autonomous payment."
      : "Elevated risk signal or high risk tier detected."
    : "No elevated risk signal detected in the preview profile."
});
