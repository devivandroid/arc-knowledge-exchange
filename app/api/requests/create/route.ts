import { isAddress } from "ethers";
import { NextResponse, type NextRequest } from "next/server";
import { createServerRequest, isLicenseType, parseTags } from "@/lib/server/agentMockStore";
import { trackReputationEvent } from "@/lib/server/reputation/reputationEventStore";
import { isValidUsdcAmount } from "@/lib/validateUsdcAmount";

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
    "requirements",
    "budgetUSDC",
    "license",
    "requesterAddress"
  ];
  const missing = required.filter((field) => !body[field]);

  if (missing.length > 0) {
    return NextResponse.json({ error: "MISSING_FIELDS", missing }, { status: 400 });
  }

  if (!isLicenseType(body.license)) {
    return NextResponse.json({ error: "INVALID_LICENSE" }, { status: 400 });
  }

  if (!isValidUsdcAmount(body.budgetUSDC)) {
    return NextResponse.json(
      { error: "INVALID_BUDGET_USDC", message: "budgetUSDC must be a positive USDC amount." },
      { status: 400 }
    );
  }

  if (typeof body.requesterAddress !== "string" || !isAddress(body.requesterAddress)) {
    return NextResponse.json({ error: "INVALID_REQUESTER_ADDRESS" }, { status: 400 });
  }

  const draft = createServerRequest({
    title: String(body.title),
    description: String(body.description),
    requirements: String(body.requirements),
    category: String(body.category || "Uncategorized"),
    tags: parseTags(body.tags),
    budgetUSDC: body.budgetUSDC,
    license: body.license,
    requesterAddress: body.requesterAddress,
    agentConsumable: Boolean(body.agentConsumable)
  });

  trackReputationEvent({
    walletAddress: body.requesterAddress,
    eventType: "REQUEST_CREATED",
    requestId: draft.id,
    amountUSDC: String(body.budgetUSDC),
    metadata: { category: draft.category }
  });

  return NextResponse.json(
    {
      request: draft,
      fundingInstructions:
        "This API creates a server-side request draft only. A human can fund a request through the UI escrow flow at /publish-resource.",
      roadmap:
        "Fully on-chain request creation by agents requires secure agent wallet integration. This API never signs blockchain transactions server-side."
    },
    { status: 201 }
  );
}
