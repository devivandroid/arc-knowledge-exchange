import { ResourceDetailClient } from "@/app/marketplace/[id]/ResourceDetailClient";
import { getServerResourceByIdAsync } from "@/lib/server/agentMockStore";

type ResourceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { id } = await params;
  const resource = (await getServerResourceByIdAsync(id)) ?? null;

  return <ResourceDetailClient initialResource={resource} resourceId={id} />;
}
