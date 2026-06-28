import { isAddress } from "ethers";
import { NextResponse, type NextRequest } from "next/server";
import {
  getRecentEventsAsync,
  trackReputationEventAsync
} from "@/lib/server/reputation/reputationEventStore";
import { maskWallet } from "@/lib/server/reputation/reputationResponse";
import type { ReputationEventType } from "@/types/reputation";

const allowedEventTypes: ReputationEventType[] = [
  "RESOURCE_VIEWED",
  "RESOURCE_PURCHASE_STARTED",
  "RESOURCE_PURCHASED",
  "RESOURCE_SOLD",
  "PAYMENT_VERIFIED",
  "RESOURCE_DOWNLOADED",
  "REQUEST_CREATED",
  "ESCROW_FUNDED",
  "DELIVERY_SUBMITTED",
  "FUNDS_RELEASED",
  "REQUEST_CANCELLED",
  "API_RESOURCE_QUERIED",
  "API_402_RETURNED",
  "API_UNLOCK_SUCCESS"
];

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") || 25);
  return NextResponse.json({
    ok: true,
    events: (await getRecentEventsAsync(limit)).map((event) => ({
      ...event,
      walletAddress: maskWallet(event.walletAddress),
      counterpartyAddress: event.counterpartyAddress
        ? maskWallet(event.counterpartyAddress)
        : undefined,
      metadata: event.metadata
    }))
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  if (typeof body.walletAddress !== "string" || !isAddress(body.walletAddress)) {
    return NextResponse.json({ ok: false, error: "INVALID_WALLET" }, { status: 400 });
  }

  if (
    typeof body.eventType !== "string" ||
    !allowedEventTypes.includes(body.eventType as ReputationEventType)
  ) {
    return NextResponse.json({ ok: false, error: "INVALID_EVENT_TYPE" }, { status: 400 });
  }

  const event = await trackReputationEventAsync({
    walletAddress: body.walletAddress,
    counterpartyAddress:
      typeof body.counterpartyAddress === "string" && isAddress(body.counterpartyAddress)
        ? body.counterpartyAddress
        : undefined,
    eventType: body.eventType as ReputationEventType,
    resourceId: typeof body.resourceId === "string" ? body.resourceId : undefined,
    requestId: typeof body.requestId === "string" ? body.requestId : undefined,
    txHash: typeof body.txHash === "string" ? body.txHash : undefined,
    amountUSDC: typeof body.amountUSDC === "string" ? body.amountUSDC : undefined,
    metadata: { source: "client_event" }
  });

  return NextResponse.json({ ok: true, eventId: event.id }, { status: 201 });
}
