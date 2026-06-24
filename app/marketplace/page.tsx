"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { ResourceCard } from "@/components/ResourceCard";
import { getAllResources } from "@/lib/localResources";
import { getInstantResources } from "@/services/resources";
import type { InstantResource } from "@/types/resource";

function sortFeaturedFirst(resources: InstantResource[]): InstantResource[] {
  return [...resources].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}

export default function MarketplacePage() {
  const [resources, setResources] = useState<InstantResource[]>(() =>
    sortFeaturedFirst(getInstantResources())
  );

  useEffect(() => {
    setResources(sortFeaturedFirst(getAllResources()));
  }, []);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Marketplace"
        title="Knowledge Marketplace"
        description="Browse premium datasets, benchmark packages, schemas, templates and machine-readable assets from independent creators. Featured datasets appear first."
      />

      <div className="mb-5 rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
        This Arc Testnet preview uses testnet USDC only. Do not upload private or confidential
        content.
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </PageShell>
  );
}
