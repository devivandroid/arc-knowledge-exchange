import { NextResponse, type NextRequest } from "next/server";
import { calculateReputation, getUniqueWallets } from "@/lib/server/reputation/calculateReputation";
import { getEvents } from "@/lib/server/reputation/reputationEventStore";
import { toReputationApiResponse } from "@/lib/server/reputation/reputationResponse";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limit = Math.max(1, Math.min(Number(request.nextUrl.searchParams.get("limit") || 10), 50));
  const riskTier = request.nextUrl.searchParams.get("riskTier");
  const events = getEvents();
  const wallets = getUniqueWallets(events);
  const summaries = wallets
    .map((wallet) => calculateReputation(wallet, events))
    .filter((summary) => !riskTier || summary.riskTier === riskTier)
    .sort((a, b) => b.reputationScore - a.reputationScore)
    .slice(0, limit)
    .map(toReputationApiResponse);

  return NextResponse.json({
    ok: true,
    name: "Knowledge Exchange Agent Risk API",
    scope: "Knowledge Exchange activity only",
    network: "Arc Testnet",
    wallets: summaries,
    limitations: [
      "Preview risk model",
      "Not an official Arc or Circle score",
      "Does not score all Arc wallets",
      "MVP preview model based on local Knowledge Exchange events"
    ]
  });
}
