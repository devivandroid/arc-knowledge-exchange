import { isAddress } from "ethers";
import { NextResponse } from "next/server";
import {
  getRiskProfileAsync,
  toPublicRiskProfileResponse
} from "@/lib/server/risk-intelligence/riskService";

type ReputationWalletContext = {
  params: Promise<{ wallet: string }>;
};

export const runtime = "nodejs";

export async function GET(_request: Request, context: ReputationWalletContext) {
  const { wallet } = await context.params;

  if (!isAddress(wallet)) {
    return NextResponse.json(
      { ok: false, error: "INVALID_WALLET", message: "Provide a valid wallet address." },
      { status: 400 }
    );
  }

  return NextResponse.json(toPublicRiskProfileResponse(await getRiskProfileAsync(wallet)));
}
