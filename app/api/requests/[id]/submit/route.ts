import { isAddress } from "ethers";
import { NextResponse, type NextRequest } from "next/server";
import { submitServerRequestDelivery } from "@/lib/server/agentMockStore";
import { trackReputationEvent } from "@/lib/server/reputation/reputationEventStore";

type SubmitRouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: SubmitRouteContext) {
  const { id } = await context.params;
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  if (typeof body.providerAddress !== "string" || !isAddress(body.providerAddress)) {
    return NextResponse.json({ error: "INVALID_PROVIDER_ADDRESS" }, { status: 400 });
  }

  if (typeof body.deliveryText !== "string" || !body.deliveryText.trim()) {
    return NextResponse.json({ error: "INVALID_DELIVERY_TEXT" }, { status: 400 });
  }

  if (
    body.deliveryHash !== undefined &&
    (typeof body.deliveryHash !== "string" || !/^0x[A-Fa-f0-9]{64}$/.test(body.deliveryHash))
  ) {
    return NextResponse.json({ error: "INVALID_DELIVERY_HASH" }, { status: 400 });
  }

  const result = submitServerRequestDelivery({
    requestId: id,
    providerAddress: body.providerAddress,
    deliveryText: body.deliveryText,
    deliveryURI: typeof body.deliveryURI === "string" ? body.deliveryURI : undefined,
    deliveryHash: typeof body.deliveryHash === "string" ? body.deliveryHash : undefined
  });

  if (!result) {
    return NextResponse.json({ error: "REQUEST_NOT_FOUND", requestId: id }, { status: 404 });
  }

  trackReputationEvent({
    walletAddress: body.providerAddress,
    counterpartyAddress: result.request.requesterAddress,
    eventType: "DELIVERY_SUBMITTED",
    requestId: id,
    metadata: { deliveryHash: result.delivery.deliveryHash }
  });

  return NextResponse.json({
    requestId: id,
    providerAddress: result.delivery.providerAddress,
    deliveryHash: result.delivery.deliveryHash,
    deliveryURI: result.delivery.deliveryURI,
    message:
      "Delivery stored in server-side ephemeral storage. Escrow-backed requests still require wallet/contract submitWork interaction for on-chain settlement."
  });
}
