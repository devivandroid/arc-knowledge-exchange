import { isAddress } from "ethers";
import { NextResponse, type NextRequest } from "next/server";
import { evaluateRiskGuardAsync } from "@/lib/server/risk-intelligence/riskService";
import type {
  ConfidenceLevel,
  RiskGuardPolicy,
  RiskTier,
  UnknownWalletBehavior
} from "@/lib/server/risk-intelligence/types";

export const runtime = "nodejs";

const riskTiers: RiskTier[] = ["Low", "Medium", "High", "Unknown"];
const confidenceLevels: ConfidenceLevel[] = ["Low", "Medium", "High"];
const unknownWalletBehaviors: UnknownWalletBehavior[] = ["allow", "review", "block"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePolicy(value: unknown): RiskGuardPolicy {
  if (value === undefined) return {};

  if (!isRecord(value)) {
    throw new Error("policy must be an object.");
  }

  const policy: RiskGuardPolicy = {};

  if (value.maxRiskScore !== undefined) {
    if (
      typeof value.maxRiskScore !== "number" ||
      !Number.isFinite(value.maxRiskScore) ||
      value.maxRiskScore < 0 ||
      value.maxRiskScore > 100
    ) {
      throw new Error("policy.maxRiskScore must be a number between 0 and 100.");
    }
    policy.maxRiskScore = value.maxRiskScore;
  }

  if (value.allowedRiskTiers !== undefined) {
    if (
      !Array.isArray(value.allowedRiskTiers) ||
      !value.allowedRiskTiers.every((tier): tier is RiskTier =>
        riskTiers.includes(tier as RiskTier)
      )
    ) {
      throw new Error("policy.allowedRiskTiers must contain only Low, Medium, High or Unknown.");
    }
    policy.allowedRiskTiers = value.allowedRiskTiers;
  }

  if (value.minimumConfidenceLevel !== undefined) {
    if (!confidenceLevels.includes(value.minimumConfidenceLevel as ConfidenceLevel)) {
      throw new Error("policy.minimumConfidenceLevel must be Low, Medium or High.");
    }
    policy.minimumConfidenceLevel = value.minimumConfidenceLevel as ConfidenceLevel;
  }

  if (value.allowUnknownParticipantType !== undefined) {
    if (typeof value.allowUnknownParticipantType !== "boolean") {
      throw new Error("policy.allowUnknownParticipantType must be a boolean.");
    }
    policy.allowUnknownParticipantType = value.allowUnknownParticipantType;
  }

  if (value.unknownWalletBehavior !== undefined) {
    if (!unknownWalletBehaviors.includes(value.unknownWalletBehavior as UnknownWalletBehavior)) {
      throw new Error("policy.unknownWalletBehavior must be allow, review or block.");
    }
    policy.unknownWalletBehavior = value.unknownWalletBehavior as UnknownWalletBehavior;
  }

  return policy;
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON", message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (!isRecord(body) || typeof body.wallet !== "string" || !isAddress(body.wallet)) {
    return NextResponse.json(
      { ok: false, error: "INVALID_WALLET", message: "Provide a valid wallet address." },
      { status: 400 }
    );
  }

  try {
    const policy = parsePolicy(body.policy);
    return NextResponse.json(await evaluateRiskGuardAsync(body.wallet, policy));
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "INVALID_POLICY",
        message: error instanceof Error ? error.message : "Invalid risk guard policy."
      },
      { status: 400 }
    );
  }
}
