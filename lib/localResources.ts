import { getInstantResourceById, getInstantResources } from "@/services/resources";
import type { InstantResource } from "@/types/resource";

const localResourcesKey = "kxPlatform:resources";
const legacyLocalResourcesKey = "arcKnowledgeExchange:resources";

export function createLocalResourceId(title: string, timestamp = Date.now()): string {
  const slug =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "resource";

  return `${slug}-${timestamp}`;
}

export function getLocalResources(): InstantResource[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value =
      window.localStorage.getItem(localResourcesKey) ??
      window.localStorage.getItem(legacyLocalResourcesKey);
    return value ? (JSON.parse(value) as InstantResource[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalResource(resource: InstantResource): void {
  if (typeof window === "undefined") {
    return;
  }

  const resources = getLocalResources().filter((item) => item.id !== resource.id);
  resources.unshift(resource);
  window.localStorage.setItem(localResourcesKey, JSON.stringify(resources));
}

export function getAllResources(): InstantResource[] {
  const bundledResources = getInstantResources();
  const localResources = getLocalResources();
  const bundledIds = new Set(bundledResources.map((resource) => resource.id));

  return [
    ...localResources.filter((resource) => !bundledIds.has(resource.id)),
    ...bundledResources
  ];
}

export function getResourceById(id: string): InstantResource | undefined {
  return getInstantResourceById(id) ?? getLocalResources().find((resource) => resource.id === id);
}
