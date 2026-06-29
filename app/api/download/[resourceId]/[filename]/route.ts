import { Readable } from "stream";
import { NextResponse, type NextRequest } from "next/server";
import { ARC_TESTNET_CHAIN_ID, ARC_TESTNET_CHAIN_ID_HEX } from "@/lib/chains/arcTestnet";
import { usdcAddress, usdcDecimals } from "@/lib/contracts/microWorkEscrow";
import { apiError } from "@/lib/server/apiResponse";
import { getServerResourceByIdAsync } from "@/lib/server/agentMockStore";
import { trackReputationEventAsync } from "@/lib/server/reputation/reputationEventStore";
import { getResourceFile } from "@/lib/server/storage/resourceStorage";
import { verifyInstantPurchase } from "@/lib/server/verifyInstantPurchase";

type DownloadRouteContext = {
  params: Promise<{ resourceId: string; filename: string }>;
};

export const runtime = "nodejs";

async function paymentRequired(resourceId: string) {
  const resource = await getServerResourceByIdAsync(resourceId);

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
      message: "Provide txHash and buyerAddress query params for a verified Arc USDC payment.",
      resourceId,
      title: resource.title,
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
      paymentVerificationEndpoint: `/api/resources/${resourceId}/verify-payment`
    },
    { status: 402 }
  );
}

export async function GET(request: NextRequest, context: DownloadRouteContext) {
  const { resourceId, filename } = await context.params;
  const resource = await getServerResourceByIdAsync(resourceId);

  if (!resource) {
    return apiError({
      status: 404,
      error: "RESOURCE_NOT_FOUND",
      message: "Resource not found.",
      details: { resourceId }
    });
  }

  const fileBelongsToResource = resource.files?.some((file) => file.filename === filename);
  if (!fileBelongsToResource) {
    return apiError({
      status: 404,
      error: "FILE_NOT_FOUND",
      message: "File not found for this resource.",
      details: { resourceId, filename }
    });
  }

  const txHash = request.nextUrl.searchParams.get("txHash");
  const buyerAddress = request.nextUrl.searchParams.get("buyerAddress");

  if (!txHash || !buyerAddress) {
    return paymentRequired(resourceId);
  }

  let result: Awaited<ReturnType<typeof verifyInstantPurchase>>;

  try {
    result = await verifyInstantPurchase({ resourceId, txHash, buyerAddress });
  } catch {
    return apiError({
      status: 502,
      error: "RPC_ERROR",
      message: "Unable to verify payment against Arc Testnet RPC.",
      details: { resourceId }
    });
  }

  if (!result.ok) {
    return paymentRequired(resourceId);
  }

  const file = await getResourceFile(resourceId, filename);
  if (!file) {
    return apiError({
      status: 404,
      error: "FILE_NOT_FOUND",
      message: "Stored file was not found.",
      details: { resourceId, filename }
    });
  }

  await trackReputationEventAsync({
    walletAddress: buyerAddress,
    counterpartyAddress: resource.sellerAddress,
    eventType: "RESOURCE_DOWNLOADED",
    resourceId,
    txHash,
    amountUSDC: resource.priceUSDC,
    metadata: { filename }
  });

  const webStream =
    file.stream instanceof Readable
      ? (Readable.toWeb(file.stream) as ReadableStream)
      : file.stream;
  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": file.metadata.mimeType,
      "Content-Length": String(file.metadata.sizeBytes),
      "Content-Disposition": `attachment; filename="${file.metadata.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
