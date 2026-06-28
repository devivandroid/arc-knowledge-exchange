import type { LicenseType, ResourceType } from "@/types/resource";

export type InstantAccessPurchase = {
  resourceId: string;
  buyerAddress: string;
  sellerAddress: string;
  amountUSDC: string;
  txHash: string;
  purchasedAt: string;
  license: LicenseType;
  resourceType: ResourceType;
};

function getPurchaseStorageKey(address: string): string {
  return `kxPlatform:purchases:${address.toLowerCase()}`;
}

function getLegacyPurchaseStorageKey(address: string): string {
  return `arcKnowledgeExchange:purchases:${address.toLowerCase()}`;
}

export function getPurchases(address: string | null | undefined): InstantAccessPurchase[] {
  if (!address || typeof window === "undefined") {
    return [];
  }

  try {
    const value =
      window.localStorage.getItem(getPurchaseStorageKey(address)) ??
      window.localStorage.getItem(getLegacyPurchaseStorageKey(address));
    return value ? (JSON.parse(value) as InstantAccessPurchase[]) : [];
  } catch {
    return [];
  }
}

export function hasPurchased(address: string | null | undefined, resourceId: string): boolean {
  return getPurchases(address).some((purchase) => purchase.resourceId === resourceId);
}

export function savePurchase(address: string, purchase: InstantAccessPurchase): void {
  if (typeof window === "undefined") {
    return;
  }

  const purchases = getPurchases(address).filter(
    (storedPurchase) => storedPurchase.resourceId !== purchase.resourceId
  );
  purchases.push(purchase);
  window.localStorage.setItem(getPurchaseStorageKey(address), JSON.stringify(purchases));
}
