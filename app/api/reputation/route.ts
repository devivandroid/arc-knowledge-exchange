import { NextResponse, type NextRequest } from "next/server";
import {
  getRiskProfilesAsync,
  toPublicRiskProfileResponse
} from "@/lib/server/risk-intelligence/riskService";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limit = Math.max(1, Math.min(Number(request.nextUrl.searchParams.get("limit") || 10), 50));
  const riskTier = request.nextUrl.searchParams.get("riskTier");
  const profiles = (await getRiskProfilesAsync(100))
    .filter((profile) => !riskTier || profile.scores.riskTier === riskTier)
    .slice(0, limit)
    .map(toPublicRiskProfileResponse);

  return NextResponse.json({
    ok: true,
    name: "KX Risk Intelligence API",
    scope: "KX activity only",
    network: "Arc Testnet",
    wallets: profiles,
    limitations: [
      "Preview risk model",
      "Not an official Arc or Circle score",
      "Does not score all Arc wallets",
      "MVP preview model based on local KX events"
    ]
  });
}
