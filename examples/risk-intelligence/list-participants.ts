import { RiskIntelligenceClient } from "../../lib/sdk/risk-intelligence";

const baseUrl = process.env.RISK_API_BASE_URL ?? "https://kx-platform.fly.dev";
const client = new RiskIntelligenceClient({ baseUrl });

const response = await client.listParticipants({ limit: 10 });

for (const participant of response.participants) {
  console.log({
    wallet: participant.wallet,
    participantType: participant.participant.type,
    participantName: participant.participant.name,
    financialBehaviorScore: participant.summary.financialBehaviorScore,
    riskTier: participant.summary.riskTier,
    confidenceLevel: participant.summary.confidenceLevel
  });
}
