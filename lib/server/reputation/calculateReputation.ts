import type { ReputationEvent, ReputationSummary, RiskTier } from "@/types/reputation";

const positiveEvents = new Set([
  "RESOURCE_PURCHASED",
  "PAYMENT_VERIFIED",
  "RESOURCE_DOWNLOADED",
  "ESCROW_FUNDED",
  "DELIVERY_SUBMITTED",
  "FUNDS_RELEASED",
  "API_UNLOCK_SUCCESS"
]);

const negativeEvents = new Set(["REQUEST_CANCELLED"]);

function toNumber(value?: string): number {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRiskTier(reputationScore: number, evidenceCount: number): RiskTier {
  if (evidenceCount === 0) return "Unknown";
  if (reputationScore >= 750 && evidenceCount >= 5) return "Low";
  if (reputationScore >= 500) return "Medium";
  return "High";
}

function getConfidence(evidenceCount: number): "Low" | "Medium" | "High" {
  if (evidenceCount >= 12) return "High";
  if (evidenceCount >= 5) return "Medium";
  return "Low";
}

export function calculateReputation(wallet: string, events: ReputationEvent[]): ReputationSummary {
  const walletEvents = events.filter(
    (event) => event.walletAddress.toLowerCase() === wallet.toLowerCase()
  );
  const evidenceCount = walletEvents.length;
  const successfulPayments = walletEvents.filter((event) =>
    ["RESOURCE_PURCHASED", "PAYMENT_VERIFIED", "FUNDS_RELEASED"].includes(event.eventType)
  ).length;
  const failedPayments = walletEvents.filter(
    (event) => event.eventType === "REQUEST_CANCELLED" || event.eventType === "RESOURCE_PURCHASE_STARTED"
  ).length;
  const startedPurchases = walletEvents.filter(
    (event) => event.eventType === "RESOURCE_PURCHASE_STARTED"
  ).length;
  const completedPurchases = walletEvents.filter(
    (event) => event.eventType === "RESOURCE_PURCHASED"
  ).length;
  const incompletePurchases = Math.max(0, startedPurchases - completedPurchases);
  const totalVolume = walletEvents.reduce((sum, event) => sum + toNumber(event.amountUSDC), 0);
  const resourcesPurchased = completedPurchases;
  const resourcesDownloaded = walletEvents.filter(
    (event) => event.eventType === "RESOURCE_DOWNLOADED"
  ).length;
  const requestsCreated = walletEvents.filter((event) => event.eventType === "REQUEST_CREATED").length;
  const escrowsFunded = walletEvents.filter((event) => event.eventType === "ESCROW_FUNDED").length;
  const deliveriesSubmitted = walletEvents.filter(
    (event) => event.eventType === "DELIVERY_SUBMITTED"
  ).length;
  const fundsReleased = walletEvents.filter((event) => event.eventType === "FUNDS_RELEASED").length;

  if (evidenceCount === 0) {
    return {
      wallet,
      reputationScore: 0,
      financialRiskScore: 0,
      riskTier: "Unknown",
      confidenceLevel: "Low",
      paymentSuccessRate: 0,
      totalVolumeUSDC: "0.00",
      successfulPayments: 0,
      failedPayments: 0,
      resourcesPurchased: 0,
      resourcesDownloaded: 0,
      requestsCreated: 0,
      escrowsFunded: 0,
      deliveriesSubmitted: 0,
      fundsReleased: 0,
      disputeRate: 0,
      refundRate: 0,
      lastActivity: null,
      evidenceCount: 0
    };
  }

  let score = 500;
  score += walletEvents.filter((event) => positiveEvents.has(event.eventType)).length * 35;
  score -= walletEvents.filter((event) => negativeEvents.has(event.eventType)).length * 85;
  score -= incompletePurchases * 45;
  score += Math.min(totalVolume * 1.4, 180);
  score += Math.min(resourcesDownloaded * 18, 90);
  score += Math.min(fundsReleased * 40, 120);
  score = Math.max(0, Math.min(1000, Math.round(score)));

  const confidenceLevel = getConfidence(evidenceCount);
  const riskTier = getRiskTier(score, evidenceCount);
  const financialRiskScore =
    riskTier === "Unknown"
      ? 0
      : Math.max(0, Math.min(100, Math.round(100 - score / 10 + incompletePurchases * 8)));
  const paymentAttempts = successfulPayments + failedPayments;
  const paymentSuccessRate = paymentAttempts > 0 ? successfulPayments / paymentAttempts : 0;
  const lastActivity = walletEvents
    .map((event) => event.timestamp)
    .sort()
    .at(-1) ?? null;

  return {
    wallet,
    reputationScore: score,
    financialRiskScore,
    riskTier,
    confidenceLevel,
    paymentSuccessRate,
    totalVolumeUSDC: totalVolume.toFixed(2),
    successfulPayments,
    failedPayments,
    resourcesPurchased,
    resourcesDownloaded,
    requestsCreated,
    escrowsFunded,
    deliveriesSubmitted,
    fundsReleased,
    disputeRate: 0,
    refundRate: 0,
    lastActivity,
    evidenceCount
  };
}

export function getUniqueWallets(events: ReputationEvent[]): string[] {
  return [...new Set(events.map((event) => event.walletAddress))];
}
