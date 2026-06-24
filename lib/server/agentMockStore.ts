import { keccak256, toUtf8Bytes } from "ethers";
import { createLocalResourceId } from "@/lib/localResources";
import { getInstantResources } from "@/services/resources";
import {
  licenseValues,
  resourceTypeValues,
  type InstantResource,
  type LicenseType,
  type ResourceType
} from "@/types/resource";

export type AgentRequestDraft = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  category: string;
  tags: string[];
  budgetUSDC: string;
  license: LicenseType;
  requesterAddress: string;
  providerAddress?: string;
  status: "Draft" | "Open" | "Submitted";
  agentConsumable: boolean;
  createdAt: string;
  delivery?: AgentRequestDelivery;
};

export type AgentRequestDelivery = {
  providerAddress: string;
  deliveryText: string;
  deliveryURI: string;
  deliveryHash: string;
  submittedAt: string;
};

type Store = {
  resources: InstantResource[];
  requests: AgentRequestDraft[];
};

const globalStore = globalThis as typeof globalThis & {
  arcKnowledgeExchangeAgentStore?: Store;
};

function getStore(): Store {
  if (!globalStore.arcKnowledgeExchangeAgentStore) {
    globalStore.arcKnowledgeExchangeAgentStore = {
      resources: [],
      requests: [
        {
          id: "mcp-integration-for-procurement-agent",
          title: "Build an MCP integration for CRM synchronization",
          description:
            "Design an MCP integration that lets an agent synchronize CRM accounts, contacts, and activity summaries into a structured knowledge workflow.",
          requirements:
            "Deliver tool definitions, request/response schemas, sync boundaries, credential handling notes, and a short implementation plan.",
          category: "Developer Tools",
          tags: ["MCP", "CRM", "Agents"],
          budgetUSDC: "7.2",
          license: "Apache-2.0",
          requesterAddress: "0x4444444444444444444444444444444444444444",
          status: "Open",
          agentConsumable: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "semantic-retrieval-pipeline-design",
          title: "Design a semantic retrieval pipeline for regulatory content",
          description:
            "Design a retrieval pipeline for regulatory content that agents can cite, filter by jurisdiction, and rank by freshness.",
          requirements:
            "Provide chunk schema, metadata fields, jurisdiction tags, ranking signals, citation format, failure modes, and an evaluation plan.",
          category: "Knowledge Engineering",
          tags: ["Retrieval", "RAG", "Metadata"],
          budgetUSDC: "7.8",
          license: "CC-BY-4.0",
          requesterAddress: "0x4444444444444444444444444444444444444444",
          status: "Open",
          agentConsumable: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "enterprise-agent-compliance-checklist",
          title: "Create an enterprise AI evaluation rubric",
          description:
            "Create a rubric for evaluating enterprise AI workflows before they are approved for internal production use.",
          requirements:
            "Include scoring categories, pass/fail criteria, risk tiers, evidence requirements, and reviewer guidance.",
          category: "AI Governance",
          tags: ["Evaluation", "Governance", "Compliance"],
          budgetUSDC: "5.9",
          license: "Commercial Use Allowed",
          requesterAddress: "0x4444444444444444444444444444444444444444",
          status: "Open",
          agentConsumable: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "prompt-library-optimization-review",
          title: "Develop a prompt QA framework for support agents",
          description:
            "Develop a QA framework for support-agent prompts across accuracy, tone, escalation, and response structure.",
          requirements:
            "Return evaluation categories, regression cases, failure examples, approval criteria, and a release-readiness checklist.",
          category: "Prompt Engineering",
          tags: ["Prompt QA", "Support Agents", "Evaluation"],
          budgetUSDC: "4.1",
          license: "Personal Use Only",
          requesterAddress: "0x4444444444444444444444444444444444444444",
          status: "Open",
          agentConsumable: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "structured-json-knowledge-base",
          title: "Build a structured financial knowledge base",
          description:
            "Convert financial policy notes into an agent-consumable knowledge base with source metadata, tags, and license fields.",
          requirements:
            "Deliver a JSON schema, representative records, validation notes, citation fields, and recommendations for durable storage.",
          category: "Financial Knowledge",
          tags: ["Finance", "Knowledge Base", "JSON"],
          budgetUSDC: "5.2",
          license: "MIT",
          requesterAddress: "0x4444444444444444444444444444444444444444",
          status: "Open",
          agentConsumable: true,
          createdAt: new Date().toISOString()
        },
        {
          id: "ai-evaluation-rubric-for-paid-resources",
          title: "Design an agent governance review process",
          description:
            "Design a review process for agents that request, purchase, transform, and reuse paid knowledge resources.",
          requirements:
            "Include role definitions, approval checkpoints, license checks, escalation paths, and a concise JSON review output.",
          category: "Agent Governance",
          tags: ["Governance", "Agents", "Review"],
          budgetUSDC: "4.8",
          license: "CC0",
          requesterAddress: "0x4444444444444444444444444444444444444444",
          status: "Open",
          agentConsumable: true,
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  return globalStore.arcKnowledgeExchangeAgentStore;
}

export function getServerResources(): InstantResource[] {
  const bundled = getInstantResources();
  const published = getStore().resources;
  const bundledIds = new Set(bundled.map((resource) => resource.id));

  return [...published.filter((resource) => !bundledIds.has(resource.id)), ...bundled];
}

export function getServerResourceById(id: string): InstantResource | undefined {
  return getServerResources().find((resource) => resource.id === id);
}

export function publishServerResource(
  input: Omit<InstantResource, "id" | "accessType"> & { id?: string }
) {
  const resource: InstantResource = {
    ...input,
    id: input.id || createLocalResourceId(input.title),
    accessType: "instant"
  };
  getStore().resources.unshift(resource);
  return resource;
}

export function getServerRequests(): AgentRequestDraft[] {
  return getStore().requests;
}

export function createServerRequest(input: Omit<AgentRequestDraft, "id" | "status" | "createdAt">) {
  const request: AgentRequestDraft = {
    ...input,
    id: createLocalResourceId(input.title),
    status: "Draft",
    createdAt: new Date().toISOString()
  };
  getStore().requests.unshift(request);
  return request;
}

export function submitServerRequestDelivery({
  requestId,
  providerAddress,
  deliveryText,
  deliveryURI,
  deliveryHash
}: {
  requestId: string;
  providerAddress: string;
  deliveryText: string;
  deliveryURI?: string;
  deliveryHash?: string;
}) {
  const request = getStore().requests.find((item) => item.id === requestId);

  if (!request) {
    return null;
  }

  const finalDeliveryURI =
    deliveryURI ||
    `data:application/json;base64,${Buffer.from(
      JSON.stringify({ deliveryText, submittedAt: new Date().toISOString() })
    ).toString("base64")}`;
  const finalDeliveryHash =
    deliveryHash || keccak256(toUtf8Bytes(`${deliveryText}:${finalDeliveryURI}`));
  const delivery: AgentRequestDelivery = {
    providerAddress,
    deliveryText,
    deliveryURI: finalDeliveryURI,
    deliveryHash: finalDeliveryHash,
    submittedAt: new Date().toISOString()
  };

  request.providerAddress = providerAddress;
  request.status = "Submitted";
  request.delivery = delivery;
  return { request, delivery };
}

export function parseTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

export function isResourceType(value: unknown): value is ResourceType {
  return typeof value === "string" && resourceTypeValues.includes(value as ResourceType);
}

export function isLicenseType(value: unknown): value is LicenseType {
  return typeof value === "string" && licenseValues.includes(value as LicenseType);
}
