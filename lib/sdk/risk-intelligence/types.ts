import type {
  ActivityLevel,
  BehavioralSignalStatus,
  ConfidenceLevel,
  RiskParticipantType,
  RiskProfileStatus,
  RiskSignalSeverity,
  RiskTier,
  RiskDataSource,
  UnknownWalletBehavior
} from "@/lib/server/risk-intelligence/types";

export type {
  ActivityLevel,
  BehavioralSignalStatus,
  ConfidenceLevel,
  RiskParticipantType,
  RiskProfileStatus,
  RiskSignalSeverity,
  RiskTier,
  RiskDataSource,
  UnknownWalletBehavior
};

export type RiskSdkParticipant = {
  type: RiskParticipantType;
  name: string | null;
  operatorAddress: string | null;
};

export type RiskSdkScores = {
  financialBehaviorScore: number | null;
  riskScore: number | null;
  riskTier: RiskTier;
  confidenceLevel: ConfidenceLevel;
};

export type RiskSdkActivity = {
  totalCompletedVolumeUSDC: string;
  completedActions: number;
  successfulPayments: number;
  failedPayments: number;
  resourcesPurchased: number;
  resourcesDownloaded: number;
  requestsCreated: number;
  protectedTransactionsFunded: number;
  deliveriesSubmitted: number;
  fundsReleased: number;
  uniqueCounterparties: number;
  averageTransactionAmountUSDC: string;
  averageActionsPerDay: string;
  lastActivity?: string;
  daysSinceLastActivity?: number;
  activityLevel: ActivityLevel;
  evidenceCount: number;
};

export type RiskSdkMetadata = {
  dataFreshness?: string;
  lastIndexed?: string;
  cacheSource?: string;
  coverage?: {
    fromBlock?: number;
    toBlock?: number;
    blocksAnalyzed?: number;
    fullHistory?: boolean;
    description?: string;
  };
};

export type RiskSdkBehavioralSignal = {
  label: string;
  value: string;
  status: BehavioralSignalStatus;
  description?: string;
};

export type RiskSdkRiskSignal = {
  label: string;
  severity: RiskSignalSeverity;
  description: string;
};

export type RiskGuardPolicy = {
  maxRiskScore?: number;
  allowedRiskTiers?: RiskTier[];
  minimumConfidenceLevel?: ConfidenceLevel;
  allowUnknownParticipantType?: boolean;
  unknownWalletBehavior?: UnknownWalletBehavior;
};

export type RiskGuardDecision = "allow" | "review" | "block";

export type RiskGuardCheck = {
  label: string;
  passed: boolean;
  value: string | number | boolean | null;
  expected: string;
};

export type RiskProfileResponse = {
  ok: true;
  service: string;
  scope: string;
  network: string;
  chainId: number;
  wallet: string;
  dataSource: RiskDataSource;
  profileStatus: RiskProfileStatus;
  message?: string;
  recommendation?: string;
  participant: RiskSdkParticipant;
  scores: RiskSdkScores;
  activity: RiskSdkActivity;
  metadata?: RiskSdkMetadata;
  behavioralSignals: RiskSdkBehavioralSignal[];
  riskSignals: RiskSdkRiskSignal[];
  limitations: string[];
  reputationScore: number | null;
  financialRiskScore: number | null;
  riskTier: RiskTier;
  confidenceLevel: ConfidenceLevel;
};

export type RiskSummaryResponse = {
  ok: true;
  service: string;
  scope: string;
  network: string;
  chainId: number;
  wallet: string;
  dataSource: RiskDataSource;
  profileStatus: RiskProfileStatus;
  message?: string;
  recommendation?: string;
  participant: RiskSdkParticipant;
  summary: {
    financialBehaviorScore: number | null;
    riskScore: number | null;
    riskTier: RiskTier;
    confidenceLevel: ConfidenceLevel;
    activityLevel: ActivityLevel;
    totalCompletedVolumeUSDC: string;
    completedActions: number;
    lastActivity: string | null;
    evidenceCount: number;
  };
  limitations: string[];
};

export type RiskSignalsResponse = {
  ok: true;
  service: string;
  scope: string;
  network: string;
  chainId: number;
  wallet: string;
  dataSource: RiskDataSource;
  profileStatus: RiskProfileStatus;
  message?: string;
  recommendation?: string;
  behavioralSignals: RiskSdkBehavioralSignal[];
  riskSignals: RiskSdkRiskSignal[];
  limitations: string[];
};

export type RiskModelResponse = {
  ok: true;
  service: string;
  name: string;
  scope: string;
  network: string;
  chainId: number;
  scoring: Record<string, unknown>;
  limitations: string[];
};

export type RiskParticipantsResponse = {
  ok: true;
  service: string;
  scope: string;
  network: string;
  participants: RiskSummaryResponse[];
  limitations: string[];
};

export type RiskGuardResponse = {
  ok: true;
  service: string;
  scope: string;
  network: string;
  chainId: number;
  wallet: string;
  profileStatus: RiskProfileStatus;
  decision: RiskGuardDecision;
  allowed: boolean;
  reason: string;
  policy: Required<RiskGuardPolicy>;
  profile: {
    scores: RiskSdkScores;
    participant: RiskSdkParticipant;
  };
  checks: RiskGuardCheck[];
  limitations: string[];
};

export type ListParticipantsParams = {
  limit?: number;
  riskTier?: RiskTier | string;
  participantType?: RiskParticipantType | string;
};

export type RiskIntelligenceClientOptions = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
};
