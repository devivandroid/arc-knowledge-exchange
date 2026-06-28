import { RiskIntelligenceClient } from "../../lib/sdk/risk-intelligence";

const client = new RiskIntelligenceClient({
  baseUrl: "https://kx-platform.fly.dev"
});

const wallet = "0x1234500000000000000000000000000000000000";

async function main() {
  const hasRiskData = await client.hasRiskData(wallet);
  const atOrBelow = await client.isRiskAtOrBelow(wallet, 40);
  const below = await client.isRiskBelow(wallet, 25);
  const above = await client.isRiskAbove(wallet, 60);

  console.log({
    wallet,
    hasRiskData,
    atOrBelow40: atOrBelow,
    below25: below,
    above60: above
  });

  console.log(
    "Threshold helpers return false for no-data profiles because there is no numeric risk score."
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
