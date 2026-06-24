import { arcTestnet } from "@/lib/chains/arcTestnet";
import { env } from "@/lib/env";

export const escrowContractAddress = env.escrowContract;
export const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS || arcTestnet.usdc.address;
export const usdcDecimals = 6;

export const taskStatusLabels = [
  "Created",
  "Funded",
  "Assigned",
  "Submitted",
  "Released",
  "Cancelled"
] as const;

export type TaskStatusLabel = (typeof taskStatusLabels)[number];

export type EscrowTask = {
  id: bigint;
  client: string;
  freelancer: string;
  amount: bigint;
  amountUsdc: string;
  status: number;
  statusLabel: TaskStatusLabel;
  metadataURI: string;
  deliveryHash: string;
  deliveryURI: string;
  createdAt: bigint;
  fundedAt: bigint;
  submittedAt: bigint;
  releasedAt: bigint;
};

export const escrowAbi = [
  {
    type: "function",
    name: "createTask",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "metadataURI", type: "string" }
    ],
    outputs: [{ name: "taskId", type: "uint256" }]
  },
  {
    type: "function",
    name: "fundTask",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "assignFreelancer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId", type: "uint256" },
      { name: "freelancer", type: "address" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "applyForTask",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "submitWork",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId", type: "uint256" },
      { name: "deliveryHash", type: "bytes32" },
      { name: "deliveryURI", type: "string" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "approveAndRelease",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "cancelTask",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: []
  },
  {
    type: "function",
    name: "getTask",
    stateMutability: "view",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "client", type: "address" },
          { name: "freelancer", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "metadataURI", type: "string" },
          { name: "deliveryHash", type: "bytes32" },
          { name: "deliveryURI", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "fundedAt", type: "uint256" },
          { name: "submittedAt", type: "uint256" },
          { name: "releasedAt", type: "uint256" }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getTaskCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "getApplicants",
    stateMutability: "view",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }]
  },
  {
    type: "function",
    name: "hasApplied",
    stateMutability: "view",
    inputs: [
      { name: "taskId", type: "uint256" },
      { name: "freelancer", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "event",
    name: "TaskCreated",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "client", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "metadataURI", type: "string", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "FreelancerApplied",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "freelancer", type: "address", indexed: true }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "TaskFunded",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "client", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ],
    anonymous: false
  }
] as const;

// After `npm run contracts:compile`, the full generated ABI is also available at:
// artifacts/contracts/WorkEscrow.sol/WorkEscrow.json
