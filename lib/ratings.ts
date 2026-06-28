export type ResourceRating = {
  resourceId: string;
  walletAddress: string;
  rating: number;
  createdAt: string;
  updatedAt?: string;
};

export type RatingSummary = {
  average: number;
  count: number;
};

const ratingsStorageKey = "knowledgeExchange:ratings";

// Preview/testnet seed ratings keep curated resources from looking empty before
// persistent verified reviews are added.
export const seededRatings: ResourceRating[] = [
  {
    resourceId: "credit-card-fraud-detection-benchmark-package",
    walletAddress: "0x1000000000000000000000000000000000000001",
    rating: 5,
    createdAt: "2026-06-01T10:00:00.000Z"
  },
  {
    resourceId: "credit-card-fraud-detection-benchmark-package",
    walletAddress: "0x1000000000000000000000000000000000000002",
    rating: 4,
    createdAt: "2026-06-02T10:00:00.000Z"
  },
  {
    resourceId: "credit-card-fraud-detection-benchmark-package",
    walletAddress: "0x1000000000000000000000000000000000000003",
    rating: 5,
    createdAt: "2026-06-03T10:00:00.000Z"
  },
  {
    resourceId: "credit-card-fraud-detection-benchmark-package",
    walletAddress: "0x1000000000000000000000000000000000000004",
    rating: 4,
    createdAt: "2026-06-04T10:00:00.000Z"
  },
  {
    resourceId: "synthetic-agent-commerce-benchmark-dataset",
    walletAddress: "0x2000000000000000000000000000000000000001",
    rating: 5,
    createdAt: "2026-06-01T10:00:00.000Z"
  },
  {
    resourceId: "synthetic-agent-commerce-benchmark-dataset",
    walletAddress: "0x2000000000000000000000000000000000000002",
    rating: 5,
    createdAt: "2026-06-02T10:00:00.000Z"
  },
  {
    resourceId: "synthetic-agent-commerce-benchmark-dataset",
    walletAddress: "0x2000000000000000000000000000000000000003",
    rating: 4,
    createdAt: "2026-06-03T10:00:00.000Z"
  },
  {
    resourceId: "synthetic-agent-commerce-benchmark-dataset",
    walletAddress: "0x2000000000000000000000000000000000000004",
    rating: 5,
    createdAt: "2026-06-04T10:00:00.000Z"
  },
  {
    resourceId: "synthetic-agent-commerce-benchmark-dataset",
    walletAddress: "0x2000000000000000000000000000000000000005",
    rating: 4,
    createdAt: "2026-06-05T10:00:00.000Z"
  },
  {
    resourceId: "agent-financial-reputation-risk-benchmark",
    walletAddress: "0x3000000000000000000000000000000000000001",
    rating: 5,
    createdAt: "2026-06-01T10:00:00.000Z"
  },
  {
    resourceId: "agent-financial-reputation-risk-benchmark",
    walletAddress: "0x3000000000000000000000000000000000000002",
    rating: 5,
    createdAt: "2026-06-02T10:00:00.000Z"
  },
  {
    resourceId: "agent-financial-reputation-risk-benchmark",
    walletAddress: "0x3000000000000000000000000000000000000003",
    rating: 4,
    createdAt: "2026-06-03T10:00:00.000Z"
  },
  {
    resourceId: "agent-financial-reputation-api-access-pack",
    walletAddress: "0x4000000000000000000000000000000000000001",
    rating: 5,
    createdAt: "2026-06-01T10:00:00.000Z"
  },
  {
    resourceId: "agent-financial-reputation-api-access-pack",
    walletAddress: "0x4000000000000000000000000000000000000002",
    rating: 4,
    createdAt: "2026-06-02T10:00:00.000Z"
  },
  {
    resourceId: "agent-financial-reputation-api-access-pack",
    walletAddress: "0x4000000000000000000000000000000000000003",
    rating: 5,
    createdAt: "2026-06-03T10:00:00.000Z"
  }
];

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

function clampRating(rating: number): number {
  return Math.min(5, Math.max(1, Math.round(rating)));
}

function readLocalRatings(): ResourceRating[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(ratingsStorageKey);
    return storedValue ? (JSON.parse(storedValue) as ResourceRating[]) : [];
  } catch {
    return [];
  }
}

function writeLocalRatings(ratings: ResourceRating[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ratingsStorageKey, JSON.stringify(ratings));
}

function ratingKey(rating: Pick<ResourceRating, "resourceId" | "walletAddress">): string {
  return `${rating.resourceId}:${normalizeAddress(rating.walletAddress)}`;
}

export function getRatings(): ResourceRating[] {
  const merged = new Map<string, ResourceRating>();

  seededRatings.forEach((rating) => {
    merged.set(ratingKey(rating), rating);
  });

  readLocalRatings().forEach((rating) => {
    merged.set(ratingKey(rating), {
      ...rating,
      walletAddress: normalizeAddress(rating.walletAddress),
      rating: clampRating(rating.rating)
    });
  });

  return Array.from(merged.values());
}

export function getResourceRatings(resourceId: string): ResourceRating[] {
  return getRatings().filter((rating) => rating.resourceId === resourceId);
}

export function getRatingSummary(resourceId: string): RatingSummary {
  const ratings = getResourceRatings(resourceId);

  if (!ratings.length) {
    return { average: 0, count: 0 };
  }

  const total = ratings.reduce((sum, rating) => sum + rating.rating, 0);
  return {
    average: Number((total / ratings.length).toFixed(1)),
    count: ratings.length
  };
}

export function getUserRating(
  walletAddress: string | null | undefined,
  resourceId: string
): ResourceRating | null {
  if (!walletAddress) {
    return null;
  }

  const normalizedAddress = normalizeAddress(walletAddress);
  return (
    getRatings().find(
      (rating) =>
        rating.resourceId === resourceId && normalizeAddress(rating.walletAddress) === normalizedAddress
    ) ?? null
  );
}

export function saveResourceRating(input: {
  resourceId: string;
  walletAddress: string;
  rating: number;
}): ResourceRating {
  const localRatings = readLocalRatings();
  const normalizedAddress = normalizeAddress(input.walletAddress);
  const now = new Date().toISOString();
  const existing = localRatings.find(
    (rating) =>
      rating.resourceId === input.resourceId &&
      normalizeAddress(rating.walletAddress) === normalizedAddress
  );

  const nextRating: ResourceRating = {
    resourceId: input.resourceId,
    walletAddress: normalizedAddress,
    rating: clampRating(input.rating),
    createdAt: existing?.createdAt ?? now,
    updatedAt: existing ? now : undefined
  };

  const nextRatings = localRatings.filter(
    (rating) =>
      !(
        rating.resourceId === input.resourceId &&
        normalizeAddress(rating.walletAddress) === normalizedAddress
      )
  );
  nextRatings.push(nextRating);
  writeLocalRatings(nextRatings);

  return nextRating;
}
