export type ReputationEventType =
  | "RESOURCE_VIEWED"
  | "RESOURCE_PURCHASE_STARTED"
  | "RESOURCE_PURCHASED"
  | "PAYMENT_VERIFIED"
  | "RESOURCE_DOWNLOADED"
  | "REQUEST_CREATED"
  | "ESCROW_FUNDED"
  | "DELIVERY_SUBMITTED"
  | "FUNDS_RELEASED"
  | "REQUEST_CANCELLED"
  | "API_RESOURCE_QUERIED"
  | "API_402_RETURNED"
  | "API_UNLOCK_SUCCESS";

export type RiskTier = "Low" | "Medium" | "High" | "Unknown";
export type ConfidenceLevel = "Low" | "Medium" | "High";

export type ReputationEvent = {
  id: string;
  timestamp: string;
  walletAddress: string;
  counterpartyAddress?: string;
  eventType: ReputationEventType;
  resourceId?: string;
  requestId?: string;
  txHash?: string;
  amountUSDC?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type ReputationSummary = {
  wallet: string;
  reputationScore: number;
  financialRiskScore: number;
  riskTier: RiskTier;
  confidenceLevel: ConfidenceLevel;
  paymentSuccessRate: number;
  totalVolumeUSDC: string;
  successfulPayments: number;
  failedPayments: number;
  resourcesPurchased: number;
  resourcesDownloaded: number;
  requestsCreated: number;
  escrowsFunded: number;
  deliveriesSubmitted: number;
  fundsReleased: number;
  disputeRate: number;
  refundRate: number;
  lastActivity: string | null;
  evidenceCount: number;
};
