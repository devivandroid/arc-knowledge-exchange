import { RiskIntelligenceClient } from "../../lib/sdk/risk-intelligence";

const client = new RiskIntelligenceClient({
  baseUrl: "https://kx-platform.fly.dev"
});

const wallet = "0x1234500000000000000000000000000000000000";

async function main() {
  const profile = await client.getProfile(wallet);

  console.log({
    wallet: profile.wallet,
    profileStatus: profile.profileStatus,
    riskTier: profile.scores.riskTier,
    riskScore: profile.scores.riskScore,
    financialBehaviorScore: profile.scores.financialBehaviorScore,
    message: profile.message,
    recommendation: profile.recommendation
  });

  if (profile.profileStatus === "no_data") {
    console.log("No data is not high risk. Use review mode or request more evidence.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
