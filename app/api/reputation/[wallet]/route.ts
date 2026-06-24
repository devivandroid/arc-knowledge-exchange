import { isAddress } from "ethers";
import { NextResponse } from "next/server";
import { calculateReputation } from "@/lib/server/reputation/calculateReputation";
import { getEvents } from "@/lib/server/reputation/reputationEventStore";
import { toReputationApiResponse } from "@/lib/server/reputation/reputationResponse";

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

  return NextResponse.json(toReputationApiResponse(calculateReputation(wallet, getEvents())));
}
