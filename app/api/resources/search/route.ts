import { NextResponse, type NextRequest } from "next/server";
import { getServerResources } from "@/lib/server/agentMockStore";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q")?.toLowerCase();
  const resourceType = params.get("resourceType");
  const category = params.get("category")?.toLowerCase();
  const license = params.get("license");
  const agentConsumable = params.get("agentConsumable");

  const resources = getServerResources().filter((resource) => {
    const text = [resource.title, resource.description, resource.category, resource.tags.join(" ")]
      .join(" ")
      .toLowerCase();

    if (q && !text.includes(q)) return false;
    if (resourceType && resource.resourceType !== resourceType) return false;
    if (category && resource.category.toLowerCase() !== category) return false;
    if (license && resource.license !== license) return false;
    if (agentConsumable && String(resource.agentConsumable) !== agentConsumable) return false;
    return true;
  });

  return NextResponse.json({
    resources: resources.map((resource) => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      resourceType: resource.resourceType,
      category: resource.category,
      tags: resource.tags,
      priceUSDC: resource.priceUSDC,
      license: resource.license,
      accessType: resource.accessType,
      featured: Boolean(resource.featured),
      featuredLabel: resource.featuredLabel,
      deliveryType: resource.deliveryType,
      files: resource.files ?? [],
      sellerAddress: resource.sellerAddress,
      agentConsumable: resource.agentConsumable,
      endpoint: `/api/resources/${resource.id}`,
      purchaseFlow: {
        type: "HTTP_402_USDC",
        verifyEndpoint: `/api/resources/${resource.id}/verify-payment`
      }
    }))
  });
}
