import { isAddress } from "ethers";
import { NextResponse, type NextRequest } from "next/server";
import {
  getEntityTypeFromLegacy,
  getLegacyParticipantType,
  getUserTypeFromLegacy,
  isEntityType,
  isParticipantType,
  isUserType
} from "@/lib/participants";
import {
  createServerRequestAsync,
  isLicenseType,
  isResourceType,
  parseTags
} from "@/lib/server/agentMockStore";
import { trackReputationEventAsync } from "@/lib/server/reputation/reputationEventStore";
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

  const budgetUSDC = body.budgetUSDC;

  if (!isValidUsdcAmount(budgetUSDC)) {
    return NextResponse.json(
      { error: "INVALID_BUDGET_USDC", message: "budgetUSDC must be a positive USDC amount." },
      { status: 400 }
    );
  }

  const requesterAddress = body.requesterAddress;

  if (typeof requesterAddress !== "string" || !isAddress(requesterAddress)) {
    return NextResponse.json({ error: "INVALID_REQUESTER_ADDRESS" }, { status: 400 });
  }

  if (
    body.operatorAddress &&
    (typeof body.operatorAddress !== "string" || !isAddress(body.operatorAddress))
  ) {
    return NextResponse.json({ error: "INVALID_OPERATOR_ADDRESS" }, { status: 400 });
  }

  const participantType = isParticipantType(body.participantType)
    ? body.participantType
    : undefined;
  const userType = isUserType(body.userType)
    ? body.userType
    : getUserTypeFromLegacy(participantType);
  const entityType = isEntityType(body.entityType)
    ? body.entityType
    : getEntityTypeFromLegacy(participantType);
  const participantName =
    typeof body.participantName === "string" && body.participantName.trim()
      ? body.participantName.trim()
      : undefined;
  const operatorAddress =
    typeof body.operatorAddress === "string" && body.operatorAddress.trim()
      ? body.operatorAddress.trim()
      : undefined;

  const draft = await createServerRequestAsync({
    title: String(body.title),
    description: String(body.description),
    requirements: String(body.requirements),
    category: String(body.category || "Uncategorized"),
    tags: parseTags(body.tags),
    budgetUSDC,
    license: body.license,
    requesterAddress,
    userType,
    entityType,
    participantType: participantType ?? getLegacyParticipantType(userType),
    participantName,
    operatorAddress,
    resourceType: isResourceType(body.resourceType) ? body.resourceType : "Custom Service",
    agentConsumable: Boolean(body.agentConsumable)
  });

  await trackReputationEventAsync({
    walletAddress: requesterAddress,
    eventType: "REQUEST_CREATED",
    requestId: draft.id,
    amountUSDC: String(budgetUSDC),
    metadata: {
      category: draft.category,
      userType,
      entityType,
      participantType: draft.participantType ?? null,
      participantName: participantName ?? null,
      operatorAddress: operatorAddress ?? null
    }
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
