import { NextResponse, type NextRequest } from "next/server";
import { ARC_TESTNET_CHAIN_ID, ARC_TESTNET_CHAIN_ID_HEX } from "@/lib/chains/arcTestnet";
import { usdcAddress, usdcDecimals } from "@/lib/contracts/microWorkEscrow";
import { apiError } from "@/lib/server/apiResponse";
import { getServerResourceById } from "@/lib/server/agentMockStore";
import { trackReputationEvent } from "@/lib/server/reputation/reputationEventStore";
import { verifyInstantPurchase } from "@/lib/server/verifyInstantPurchase";

type ResourceRouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

function paymentRequired(resourceId: string) {
  const resource = getServerResourceById(resourceId);

  if (!resource) {
    return apiError({
      status: 404,
      error: "RESOURCE_NOT_FOUND",
      message: "Resource not found.",
      details: { resourceId }
    });
  }

  return NextResponse.json(
    {
      ok: false,
      error: "PAYMENT_REQUIRED",
      message:
        "Pay the seller with ERC-20 USDC on Arc Testnet, then retry with txHash and buyerAddress.",
      resourceId,
      title: resource.title,
      deliveryType: resource.deliveryType,
      priceUSDC: resource.priceUSDC,
      sellerAddress: resource.sellerAddress,
      network: "Arc Testnet",
      chainId: ARC_TESTNET_CHAIN_ID,
      chainIdHex: ARC_TESTNET_CHAIN_ID_HEX,
      usdcAddress,
      paymentInstructions: {
        method: "ERC20_TRANSFER",
        token: "USDC",
        decimals: usdcDecimals,
        to: resource.sellerAddress,
        amountUSDC: resource.priceUSDC
      },
      paymentVerificationEndpoint: `/api/resources/${resourceId}/verify-payment`,
      resourceEndpoint: `/api/resources/${resourceId}?txHash={txHash}&buyerAddress={buyerAddress}`
    },
    { status: 402 }
  );
}

export async function GET(request: NextRequest, context: ResourceRouteContext) {
  const { id } = await context.params;
  const txHash = request.nextUrl.searchParams.get("txHash");
  const buyerAddress = request.nextUrl.searchParams.get("buyerAddress");
  const resource = getServerResourceById(id);

  if (resource && buyerAddress) {
    trackReputationEvent({
      walletAddress: buyerAddress,
      counterpartyAddress: resource.sellerAddress,
      eventType: "API_RESOURCE_QUERIED",
      resourceId: id
    });
  }

  if (!txHash || !buyerAddress) {
    if (resource && buyerAddress) {
      trackReputationEvent({
        walletAddress: buyerAddress,
        counterpartyAddress: resource.sellerAddress,
        eventType: "API_402_RETURNED",
        resourceId: id,
        amountUSDC: resource.priceUSDC
      });
    }
    return paymentRequired(id);
  }

  let result: Awaited<ReturnType<typeof verifyInstantPurchase>>;

  try {
    result = await verifyInstantPurchase({ resourceId: id, txHash, buyerAddress });
  } catch {
    return apiError({
      status: 502,
      error: "RPC_ERROR",
      message: "Unable to verify payment against Arc Testnet RPC.",
      details: { resourceId: id }
    });
  }

  if (!result.ok) {
    return paymentRequired(id);
  }

  trackReputationEvent({
    walletAddress: buyerAddress,
    counterpartyAddress: result.resource.sellerAddress,
    eventType: "API_UNLOCK_SUCCESS",
    resourceId: id,
    txHash,
    amountUSDC: result.resource.priceUSDC
  });

  const deliveryType = result.resource.deliveryType ?? "inline";

  if (deliveryType === "download") {
    return NextResponse.json({
      ok: true,
      resourceId: result.resource.id,
      id: result.resource.id,
      title: result.resource.title,
      deliveryType,
      license: result.resource.license,
      resourceType: result.resource.resourceType,
      files: (result.resource.files ?? []).map((file) => ({
        ...file,
        downloadUrl: `/api/download/${result.resource.id}/${encodeURIComponent(
          file.filename
        )}?txHash=${encodeURIComponent(txHash)}&buyerAddress=${encodeURIComponent(buyerAddress)}`
      })),
      content: result.resource.unlockedContentMock,
      receipt: result.receipt
    });
  }

  return NextResponse.json({
    ok: true,
    id: result.resource.id,
    resourceId: result.resource.id,
    title: result.resource.title,
    deliveryType,
    license: result.resource.license,
    resourceType: result.resource.resourceType,
    content: result.resource.unlockedContentMock,
    receipt: result.receipt
  });
}
