import { RiskIntelligenceClient } from "../../lib/sdk/risk-intelligence";

const baseUrl = process.env.RISK_API_BASE_URL ?? "https://kx-platform.fly.dev";
const wallet =
  process.env.RISK_WALLET ?? "0x8e0a1111111111111111111111111111111125be";

const client = new RiskIntelligenceClient({ baseUrl });
const profile = await client.getProfile(wallet);

console.log({
  wallet: profile.wallet,
  profileStatus: profile.profileStatus,
  participant: profile.participant,
  financialBehaviorScore: profile.scores.financialBehaviorScore,
  riskScore: profile.scores.riskScore,
  riskTier: profile.scores.riskTier,
  confidenceLevel: profile.scores.confidenceLevel
});
