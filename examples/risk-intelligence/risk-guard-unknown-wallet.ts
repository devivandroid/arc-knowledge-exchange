import { RiskIntelligenceClient } from "../../lib/sdk/risk-intelligence";

const client = new RiskIntelligenceClient({
  baseUrl: "https://kx-platform.fly.dev"
});

const wallet = "0x1234500000000000000000000000000000000000";

async function main() {
  for (const unknownWalletBehavior of ["review", "allow", "block"] as const) {
    const decision = await client.evaluateTransactionRisk(wallet, {
      maxRiskScore: 40,
      allowedRiskTiers: ["Low", "Medium"],
      minimumConfidenceLevel: "Medium",
      unknownWalletBehavior
    });

    console.log({
      unknownWalletBehavior,
      profileStatus: decision.profileStatus,
      decision: decision.decision,
      allowed: decision.allowed,
      reason: decision.reason
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
