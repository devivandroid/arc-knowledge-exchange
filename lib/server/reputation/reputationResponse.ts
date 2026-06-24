import { ARC_TESTNET_CHAIN_ID } from "@/lib/chains/arcTestnet";
import type { ReputationSummary } from "@/types/reputation";

export const reputationLimitations = [
  "Based only on Knowledge Exchange events",
  "Not an official Arc score",
  "MVP risk model",
  "Preview storage is local/ephemeral",
  "Future Arc-wide indexing is roadmap only"
];

export function toReputationApiResponse(summary: ReputationSummary) {
  return {
    ok: true,
    wallet: summary.wallet,
    scope: "Knowledge Exchange activity only",
    network: "Arc Testnet",
    chainId: ARC_TESTNET_CHAIN_ID,
    reputationScore: summary.reputationScore,
    financialRiskScore: summary.financialRiskScore,
    riskTier: summary.riskTier,
    confidenceLevel: summary.confidenceLevel,
    metrics: {
      totalVolumeUSDC: summary.totalVolumeUSDC,
      successfulPayments: summary.successfulPayments,
      failedPayments: summary.failedPayments,
      resourcesPurchased: summary.resourcesPurchased,
      resourcesDownloaded: summary.resourcesDownloaded,
      requestsCreated: summary.requestsCreated,
      escrowsFunded: summary.escrowsFunded,
      deliveriesSubmitted: summary.deliveriesSubmitted,
      fundsReleased: summary.fundsReleased,
      paymentSuccessRate: summary.paymentSuccessRate,
      disputeRate: summary.disputeRate,
      refundRate: summary.refundRate,
      evidenceCount: summary.evidenceCount
    },
    lastActivity: summary.lastActivity,
    limitations: reputationLimitations
  };
}

export function maskWallet(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
