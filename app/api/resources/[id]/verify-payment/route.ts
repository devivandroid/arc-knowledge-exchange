import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/server/apiResponse";
import { savePurchaseReceipt } from "@/lib/server/purchaseReceipts";
import { trackInstantPurchaseRiskEvents } from "@/lib/server/reputation/reputationEventStore";
import { verifyInstantPurchase } from "@/lib/server/verifyInstantPurchase";

type VerifyPaymentRouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function POST(request: NextRequest, context: VerifyPaymentRouteContext) {
  const { id } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return apiError({
      status: 400,
      error: "INVALID_JSON",
      message: "Request body must be valid JSON.",
      extra: { accessGranted: false }
    });
  }

  const { txHash, buyerAddress } = body as {
    txHash?: unknown;
    buyerAddress?: unknown;
  };

  if (typeof txHash !== "string" || typeof buyerAddress !== "string") {
    return apiError({
      status: 400,
      error: "INVALID_INPUT",
      message: "Provide txHash and buyerAddress as strings.",
      extra: { accessGranted: false }
    });
  }

  let result: Awaited<ReturnType<typeof verifyInstantPurchase>>;

  try {
    result = await verifyInstantPurchase({ resourceId: id, txHash, buyerAddress });
  } catch {
    return apiError({
      status: 502,
      error: "RPC_ERROR",
      message: "Unable to verify payment against Arc Testnet RPC.",
      extra: { accessGranted: false },
      details: { resourceId: id }
    });
  }

  if (!result.ok) {
    return apiError({
      status: result.status,
      error: result.error,
      message: result.message,
      extra: { accessGranted: false },
      details: { resourceId: id }
    });
  }

  await savePurchaseReceipt(result.receipt);
  await trackInstantPurchaseRiskEvents({
    txHash,
    resourceId: id,
    buyerAddress,
    sellerAddress: result.resource.sellerAddress,
    amountUSDC: result.resource.priceUSDC
  });

  return NextResponse.json({
    ok: true,
    accessGranted: true,
    resourceId: id,
    receipt: result.receipt,
    accessToken: result.accessToken
  });
}
