import { NextResponse, type NextRequest } from "next/server";
import { getServerRequestsAsync } from "@/lib/server/agentMockStore";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.toLowerCase();
  const category = params.get("category")?.toLowerCase();
  const license = params.get("license");
  const resourceType = params.get("resourceType");
  const status = params.get("status");
  const agentConsumable = params.get("agentConsumable");

  const requests = (await getServerRequestsAsync()).filter((item) => {
    const text = [item.title, item.description, item.requirements, item.tags.join(" ")]
      .join(" ")
      .toLowerCase();

    if (q && !text.includes(q)) return false;
    if (category && item.category.toLowerCase() !== category) return false;
    if (resourceType && (item.resourceType || "Custom Service") !== resourceType) return false;
    if (license && item.license !== license) return false;
    if (status && item.status !== status) return false;
    if (agentConsumable && String(item.agentConsumable) !== agentConsumable) return false;
    return true;
  });

  return NextResponse.json({
    requests: requests.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      requirements: item.requirements,
      budgetUSDC: item.budgetUSDC,
      license: item.license,
      requesterAddress: item.requesterAddress,
      userType: item.userType ?? null,
      entityType: item.entityType ?? null,
      participantType: item.participantType,
      participantName: item.participantName,
      operatorAddress: item.operatorAddress,
      resourceType: item.resourceType || "Custom Service",
      providerAddress: item.providerAddress ?? null,
      providerUserType: item.providerUserType ?? null,
      providerEntityType: item.providerEntityType ?? null,
      providerParticipantType: item.providerParticipantType,
      providerParticipantName: item.providerParticipantName,
      providerOperatorAddress: item.providerOperatorAddress,
      status: item.status,
      agentConsumable: item.agentConsumable,
      detailUrl: `/requests`
    }))
  });
}
