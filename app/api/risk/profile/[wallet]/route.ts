import { isAddress } from "ethers";
import { NextResponse } from "next/server";
import {
  getArcNetworkRiskProfileAsync,
  getCombinedRiskProfileAsync,
  getRiskProfileAsync,
  toPublicRiskProfileResponse
} from "@/lib/server/risk-intelligence/riskService";

type RiskWalletContext = {
  params: Promise<{ wallet: string }>;
};

export const runtime = "nodejs";

export async function GET(request: Request, context: RiskWalletContext) {
  const { wallet } = await context.params;
  const source = new URL(request.url).searchParams.get("source");

  if (!isAddress(wallet)) {
    return NextResponse.json(
      { ok: false, error: "INVALID_WALLET", message: "Provide a valid wallet address." },
      { status: 400 }
    );
  }

  if (source === "internal" || source === "knowledge_exchange") {
    return NextResponse.json(toPublicRiskProfileResponse(await getRiskProfileAsync(wallet)));
  }

  if (source === "arc_network") {
    return NextResponse.json(toPublicRiskProfileResponse(await getArcNetworkRiskProfileAsync(wallet)));
  }

  return NextResponse.json(toPublicRiskProfileResponse(await getCombinedRiskProfileAsync(wallet)));
}
