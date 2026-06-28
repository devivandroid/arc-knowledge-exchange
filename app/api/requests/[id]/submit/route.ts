import { isAddress } from "ethers";
import { NextResponse, type NextRequest } from "next/server";
import { isParticipantType } from "@/lib/participants";
import { submitServerRequestDeliveryAsync } from "@/lib/server/agentMockStore";
import { trackReputationEventAsync } from "@/lib/server/reputation/reputationEventStore";

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

  if (
    body.providerOperatorAddress &&
    (typeof body.providerOperatorAddress !== "string" || !isAddress(body.providerOperatorAddress))
  ) {
    return NextResponse.json({ error: "INVALID_PROVIDER_OPERATOR_ADDRESS" }, { status: 400 });
  }

  const providerParticipantType = isParticipantType(body.providerParticipantType)
    ? body.providerParticipantType
    : undefined;
  const providerParticipantName =
    typeof body.providerParticipantName === "string" && body.providerParticipantName.trim()
      ? body.providerParticipantName.trim()
      : undefined;
  const providerOperatorAddress =
    typeof body.providerOperatorAddress === "string" && body.providerOperatorAddress.trim()
      ? body.providerOperatorAddress.trim()
      : undefined;

  const result = await submitServerRequestDeliveryAsync({
    requestId: id,
    providerAddress: body.providerAddress,
    providerParticipantType,
    providerParticipantName,
    providerOperatorAddress,
    deliveryText: body.deliveryText,
    deliveryURI: typeof body.deliveryURI === "string" ? body.deliveryURI : undefined,
    deliveryHash: typeof body.deliveryHash === "string" ? body.deliveryHash : undefined
  });

  if (!result) {
    return NextResponse.json({ error: "REQUEST_NOT_FOUND", requestId: id }, { status: 404 });
  }

  await trackReputationEventAsync({
    walletAddress: body.providerAddress,
    counterpartyAddress: result.request.requesterAddress,
    eventType: "DELIVERY_SUBMITTED",
    requestId: id,
    metadata: {
      deliveryHash: result.delivery.deliveryHash,
      participantType: providerParticipantType ?? null,
      participantName: providerParticipantName ?? null,
      operatorAddress: providerOperatorAddress ?? null
    }
  });

  return NextResponse.json({
    requestId: id,
    providerAddress: result.delivery.providerAddress,
    providerParticipantType,
    providerParticipantName,
    providerOperatorAddress,
    deliveryHash: result.delivery.deliveryHash,
    deliveryURI: result.delivery.deliveryURI,
    message:
      "Delivery stored. With DATABASE_URL configured, it is persisted in PostgreSQL. Escrow-backed requests still require wallet/contract submitWork interaction for on-chain settlement."
  });
}
