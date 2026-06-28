"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { ResourceCard } from "@/components/ResourceCard";
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
    let cancelled = false;

    async function loadResources() {
      const response = await fetch("/api/resources/search");
      const body = (await response.json()) as { resources?: InstantResource[] };

      if (!cancelled && body.resources) {
        setResources(sortFeaturedFirst(body.resources));
      }
    }

    loadResources().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Marketplace"
        title="Marketplace"
        description="Browse premium services, datasets, benchmark packages, schemas, templates and machine-readable assets from independent creators. Featured resources appear first."
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
