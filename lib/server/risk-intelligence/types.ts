export type RiskParticipantType = "human" | "agent" | "organization" | "unknown";
export type RiskTier = "Low" | "Medium" | "High" | "Unknown";
export type ConfidenceLevel = "Low" | "Medium" | "High";
export type ActivityLevel = "Dormant" | "Low" | "Normal" | "High" | "Unknown";
export type BehavioralSignalStatus = "Normal" | "Watch" | "Elevated" | "Unknown";
export type RiskSignalSeverity = "Info" | "Watch" | "Elevated";
export type RiskGuardDecision = "allow" | "review" | "block";
export type RiskProfileStatus = "active" | "limited" | "no_data";
export type UnknownWalletBehavior = "allow" | "review" | "block";
export type RiskDataSource = "knowledge_exchange" | "arc_network" | "combined" | "no_data";

export interface RiskGuardPolicy {
  maxRiskScore?: number;
  allowedRiskTiers?: RiskTier[];
  minimumConfidenceLevel?: ConfidenceLevel;
  allowUnknownParticipantType?: boolean;
  unknownWalletBehavior?: UnknownWalletBehavior;
}

export type RiskGuardCheck = {
  label: string;
  passed: boolean;
  value: string | number | boolean | null;
  expected: string;
};

export interface RiskProfile {
  wallet: string;
  dataSource?: RiskDataSource;
  profileStatus: RiskProfileStatus;
  message?: string;
  recommendation?: string;
  participant: {
    type: RiskParticipantType;
    userType?: "HUMAN" | "AGENT" | "unknown";
    entityType?: "INDIVIDUAL" | "BUSINESS" | "ORGANIZATION" | "unknown";
    name?: string;
    operatorAddress?: string;
  };
  scores: {
    financialBehaviorScore: number | null;
    riskScore: number | null;
    riskTier: RiskTier;
    confidenceLevel: ConfidenceLevel;
  };
  activity: {
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
  metadata?: {
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
  behavioralSignals: Array<{
    label: string;
    value: string;
    status: BehavioralSignalStatus;
    description?: string;
  }>;
  riskSignals: Array<{
    label: string;
    severity: RiskSignalSeverity;
    description: string;
  }>;
  limitations: string[];
}
