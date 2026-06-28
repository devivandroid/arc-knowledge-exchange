import { NextResponse, type NextRequest } from "next/server";
import {
  getRiskProfilesAsync,
  riskServiceLimitations,
  riskServiceNetwork,
  riskServiceScope,
  toRiskSummaryResponse
} from "@/lib/server/risk-intelligence/riskService";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limit = Math.max(1, Math.min(Number(request.nextUrl.searchParams.get("limit") || 25), 100));
  const riskTier = request.nextUrl.searchParams.get("riskTier");
  const participantType = request.nextUrl.searchParams.get("participantType");
  const participants = (await getRiskProfilesAsync(100))
    .filter((profile) => !riskTier || profile.scores.riskTier === riskTier)
    .filter((profile) => !participantType || profile.participant.type === participantType)
    .slice(0, limit)
    .map((profile) => toRiskSummaryResponse(profile));

  return NextResponse.json({
    ok: true,
    service: "KX Public Risk Intelligence Service",
    scope: riskServiceScope,
    network: riskServiceNetwork,
    participants,
    limitations: riskServiceLimitations
  });
}
