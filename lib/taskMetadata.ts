export type TaskMetadata = {
  title?: string;
  description?: string;
  requirements?: string;
  category?: string;
  tags?: string[];
  budgetUSDC?: string;
  license?: string;
  accessType?: "instant" | "manual";
  requesterAddress?: string;
  providerAddress?: string;
  resourceType?: string;
  agentConsumable?: boolean;
  deadline?: string | null;
  note?: string;
  submittedAt?: string;
  createdFrom?: string;
};

export function parseTaskMetadata(metadataURI: string): TaskMetadata | null {
  if (!metadataURI) {
    return null;
  }

  try {
    if (metadataURI.startsWith("data:application/json;base64,")) {
      const encoded = metadataURI.replace("data:application/json;base64,", "");
      return JSON.parse(atob(encoded)) as TaskMetadata;
    }

    if (metadataURI.trim().startsWith("{")) {
      return JSON.parse(metadataURI) as TaskMetadata;
    }
  } catch {
    return null;
  }

  return null;
}

export function getTaskDisplayTitle(metadataURI: string, fallback: string): string {
  return parseTaskMetadata(metadataURI)?.title || fallback;
}

export function getTaskDisplayDescription(metadataURI: string): string {
  const metadata = parseTaskMetadata(metadataURI);

  return metadata?.description || metadataURI;
}
