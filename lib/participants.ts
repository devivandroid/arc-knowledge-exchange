import type { EntityType, ParticipantType, UserType } from "@/types/resource";

export type ApiParticipantType = ParticipantType | "unknown";

const labels: Record<ParticipantType, string> = {
  human: "Human",
  agent: "Agent",
  organization: "Organization"
};

export function getParticipantLabel(type?: ParticipantType | null): string {
  return type ? labels[type] : "Human";
}

export function getApiParticipantType(type?: ParticipantType | null): ApiParticipantType {
  return type ?? "unknown";
}

export function isParticipantType(value: unknown): value is ParticipantType {
  return value === "human" || value === "agent" || value === "organization";
}

export function isUserType(value: unknown): value is UserType {
  return value === "HUMAN" || value === "AGENT";
}

export function isEntityType(value: unknown): value is EntityType {
  return value === "INDIVIDUAL" || value === "BUSINESS" || value === "ORGANIZATION";
}

export function getUserTypeLabel(type?: UserType | null): string {
  if (type === "AGENT") return "Agent";
  return "Human";
}

export function getEntityTypeLabel(type?: EntityType | null): string {
  if (type === "BUSINESS") return "Business";
  if (type === "ORGANIZATION") return "Organization";
  return "Individual";
}

export function getLegacyParticipantType(userType?: UserType | null): ParticipantType {
  return userType === "AGENT" ? "agent" : "human";
}

export function getUserTypeFromLegacy(type?: ParticipantType | null): UserType {
  return type === "agent" ? "AGENT" : "HUMAN";
}

export function getEntityTypeFromLegacy(type?: ParticipantType | null): EntityType {
  return type === "organization" ? "ORGANIZATION" : "INDIVIDUAL";
}

export function getParticipantBadgeClass(type?: ParticipantType | null): string {
  if (type === "agent") {
    return "border-arc-blue/40 bg-arc-blue/10 text-arc-blue";
  }

  if (type === "organization") {
    return "border-purple-300/40 bg-purple-300/10 text-purple-100";
  }

  return "border-white/30 bg-white/10 text-white";
}
