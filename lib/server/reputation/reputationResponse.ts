import { ARC_TESTNET_CHAIN_ID } from "@/lib/chains/arcTestnet";
import { getApiParticipantType } from "@/lib/participants";
import type { ReputationSummary } from "@/types/reputation";

export const reputationLimitations = [
  "Based only on KX events",
  "Not an official Arc or Circle score",
  "MVP risk model",
  "Preview storage is local/ephemeral",
  "Future Arc-wide indexing is roadmap only"
];

export function toReputationApiResponse(summary: ReputationSummary) {
  const participantType = getApiParticipantType(summary.participantType);

  return {
    ok: true,
    wallet: summary.wallet,
    scope: "KX activity only",
    network: "Arc Testnet",
    chainId: ARC_TESTNET_CHAIN_ID,
    participantType,
    participantName: summary.participantName ?? null,
    operatorAddress: summary.operatorAddress ?? null,
    participant: {
      type: participantType,
      name: summary.participantName ?? null,
      operatorAddress: summary.operatorAddress ?? null
    },
    scores: {
      financialBehaviorScore: summary.reputationScore,
      riskScore: summary.financialRiskScore,
      riskTier: summary.riskTier,
      confidenceLevel: summary.confidenceLevel
    },
    reputationScore: summary.reputationScore,
    financialRiskScore: summary.financialRiskScore,
    riskTier: summary.riskTier,
    confidenceLevel: summary.confidenceLevel,
    activity: {
      totalCompletedVolumeUSDC: summary.totalCompletedVolumeUSDC,
      completedActions: summary.completedActions,
      successfulPayments: summary.successfulPayments,
      failedPayments: summary.failedPayments,
      resourcesPurchased: summary.resourcesPurchased,
      resourcesDownloaded: summary.resourcesDownloaded,
      requestsCreated: summary.requestsCreated,
      escrowsFunded: summary.escrowsFunded,
      deliveriesSubmitted: summary.deliveriesSubmitted,
      fundsReleased: summary.fundsReleased,
      uniqueCounterparties: summary.uniqueCounterparties,
      averageTransactionAmountUSDC: summary.averageTransactionAmountUSDC,
      averageActionsPerDay: summary.averageActionsPerDay,
      lastActivity: summary.lastActivity,
      daysSinceLastActivity: summary.daysSinceLastActivity,
      evidenceCount: summary.evidenceCount,
      activityLevel: summary.activityLevel
    },
    metrics: {
      totalVolumeUSDC: summary.totalVolumeUSDC,
      totalCompletedVolumeUSDC: summary.totalCompletedVolumeUSDC,
      completedActions: summary.completedActions,
      successfulPayments: summary.successfulPayments,
      failedPayments: summary.failedPayments,
      resourcesPurchased: summary.resourcesPurchased,
      resourcesDownloaded: summary.resourcesDownloaded,
      requestsCreated: summary.requestsCreated,
      escrowsFunded: summary.escrowsFunded,
      deliveriesSubmitted: summary.deliveriesSubmitted,
      fundsReleased: summary.fundsReleased,
      uniqueCounterparties: summary.uniqueCounterparties,
      averageTransactionAmountUSDC: summary.averageTransactionAmountUSDC,
      averageActionsPerDay: summary.averageActionsPerDay,
      daysSinceLastActivity: summary.daysSinceLastActivity,
      activityLevel: summary.activityLevel,
      paymentSuccessRate: summary.paymentSuccessRate,
      purchaseStartAbandonmentRate: summary.purchaseStartAbandonmentRate,
      escrowCompletionRate: summary.escrowCompletionRate,
      downloadAfterPurchaseRate: summary.downloadAfterPurchaseRate,
      volumeConcentrationRate: summary.volumeConcentrationRate,
      disputeRate: summary.disputeRate,
      refundRate: summary.refundRate,
      evidenceCount: summary.evidenceCount
    },
    behavioralSignals: summary.behavioralSignals,
    riskSignals: summary.riskSignals,
    lastActivity: summary.lastActivity,
    limitations: reputationLimitations
  };
}

export function maskWallet(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
