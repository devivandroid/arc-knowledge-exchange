import { isAddress } from "ethers";
import { NextResponse, type NextRequest } from "next/server";
import {
  isLicenseType,
  isResourceType,
  parseTags,
  publishServerResource
} from "@/lib/server/agentMockStore";
import { isValidUsdcAmount } from "@/lib/validateUsdcAmount";
import type { DeliveryType, ResourceFile } from "@/types/resource";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const required = [
    "title",
    "description",
    "resourceType",
    "priceUSDC",
    "license",
    "sellerAddress"
  ];
  const missing = required.filter((field) => !body[field]);

  if (missing.length > 0) {
    return NextResponse.json({ error: "MISSING_FIELDS", missing }, { status: 400 });
  }

  if (!isResourceType(body.resourceType) || !isLicenseType(body.license)) {
    return NextResponse.json({ error: "INVALID_METADATA" }, { status: 400 });
  }

  if (!isValidUsdcAmount(body.priceUSDC)) {
    return NextResponse.json(
      { error: "INVALID_PRICE_USDC", message: "priceUSDC must be a positive USDC amount." },
      { status: 400 }
    );
  }

  if (typeof body.sellerAddress !== "string" || !isAddress(body.sellerAddress)) {
    return NextResponse.json({ error: "INVALID_SELLER_ADDRESS" }, { status: 400 });
  }

  const deliveryType = body.deliveryType === "download" ? "download" : "inline";
  const files = Array.isArray(body.files) ? (body.files as ResourceFile[]) : [];

  if (deliveryType === "download" && files.length === 0) {
    return NextResponse.json(
      { error: "MISSING_FILES", message: "Downloadable resources require at least one file." },
      { status: 400 }
    );
  }

  const resource = publishServerResource({
    id: typeof body.id === "string" ? body.id : undefined,
    title: String(body.title),
    description: String(body.description),
    resourceType: body.resourceType,
    category: String(body.category || "Uncategorized"),
    tags: parseTags(body.tags),
    priceUSDC: body.priceUSDC,
    license: body.license,
    sellerAddress: body.sellerAddress,
    deliveryType: deliveryType as DeliveryType,
    previewText: String(body.previewText || body.description),
    lockedContentURI: "server-memory://resource",
    unlockedContentMock:
      typeof body.unlockedContentMock === "string" ? body.unlockedContentMock : undefined,
    files,
    agentConsumable: Boolean(body.agentConsumable)
  });

  return NextResponse.json(
    {
      resource,
      endpoint: `/api/resources/${resource.id}`,
      purchaseEndpoint: `/api/resources/${resource.id}`,
      message:
        "Resource published to server-side ephemeral storage. It may reset when the server restarts."
    },
    { status: 201 }
  );
}
