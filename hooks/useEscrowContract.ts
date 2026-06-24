"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Contract, formatUnits, parseUnits, type ContractTransactionResponse } from "ethers";
import {
  escrowAbi,
  escrowContractAddress,
  taskStatusLabels,
  usdcDecimals,
  type EscrowTask
} from "@/lib/contracts/microWorkEscrow";
import { getReadOnlyProvider } from "@/lib/web3";
import { useWallet } from "@/hooks/useWallet";

type RawTask = {
  id: bigint;
  client: string;
  freelancer: string;
  amount: bigint;
  status: bigint;
  metadataURI: string;
  deliveryHash: string;
  deliveryURI: string;
  createdAt: bigint;
  fundedAt: bigint;
  submittedAt: bigint;
  releasedAt: bigint;
};

type EscrowContract = Contract & {
  createTask: (amount: bigint, metadataURI: string) => Promise<ContractTransactionResponse>;
  fundTask: (taskId: bigint) => Promise<ContractTransactionResponse>;
  assignFreelancer: (taskId: bigint, freelancer: string) => Promise<ContractTransactionResponse>;
  applyForTask: (taskId: bigint) => Promise<ContractTransactionResponse>;
  submitWork: (
    taskId: bigint,
    deliveryHash: string,
    deliveryURI: string
  ) => Promise<ContractTransactionResponse>;
  approveAndRelease: (taskId: bigint) => Promise<ContractTransactionResponse>;
  cancelTask: (taskId: bigint) => Promise<ContractTransactionResponse>;
  getTask: (taskId: bigint) => Promise<RawTask>;
  getTaskCount: () => Promise<bigint>;
  getApplicants: (taskId: bigint) => Promise<string[]>;
  hasApplied: (taskId: bigint, freelancer: string) => Promise<boolean>;
};

export const isEscrowConfigured = Boolean(escrowContractAddress);

function getReadEscrowContract(): EscrowContract {
  if (!escrowContractAddress) {
    throw new Error("Escrow contract is not configured.");
  }

  const provider = getReadOnlyProvider();

  if (!provider) {
    throw new Error("Arc RPC URL is not configured.");
  }

  return new Contract(escrowContractAddress, escrowAbi, provider) as unknown as EscrowContract;
}

function mapTask(task: RawTask): EscrowTask {
  const status = Number(task.status);

  return {
    id: task.id,
    client: task.client,
    freelancer: task.freelancer,
    amount: task.amount,
    amountUsdc: formatUnits(task.amount, usdcDecimals),
    status,
    statusLabel: taskStatusLabels[status] ?? "Created",
    metadataURI: task.metadataURI,
    deliveryHash: task.deliveryHash,
    deliveryURI: task.deliveryURI,
    createdAt: task.createdAt,
    fundedAt: task.fundedAt,
    submittedAt: task.submittedAt,
    releasedAt: task.releasedAt
  };
}

export function useEscrowContract() {
  const { provider, isArcTestnet } = useWallet();
  const queryClient = useQueryClient();

  const getWriteContract = useCallback(async (): Promise<EscrowContract> => {
    if (!escrowContractAddress) {
      throw new Error("Escrow contract is not configured.");
    }

    if (!provider) {
      throw new Error("Connect MetaMask first.");
    }

    if (!isArcTestnet) {
      throw new Error("Switch to Arc Testnet first.");
    }

    const signer = await provider.getSigner();
    return new Contract(escrowContractAddress, escrowAbi, signer) as unknown as EscrowContract;
  }, [isArcTestnet, provider]);

  const invalidateTasks = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["escrow"] });
  }, [queryClient]);

  const createTask = useCallback(
    async (amountUsdc: string, metadataURI: string) => {
      const contract = await getWriteContract();
      return contract.createTask(parseUnits(amountUsdc, usdcDecimals), metadataURI);
    },
    [getWriteContract]
  );

  const fundTask = useCallback(
    async (taskId: bigint) => {
      const contract = await getWriteContract();
      return contract.fundTask(taskId);
    },
    [getWriteContract]
  );

  const assignFreelancer = useCallback(
    async (taskId: bigint, freelancer: string) => {
      const contract = await getWriteContract();
      return contract.assignFreelancer(taskId, freelancer);
    },
    [getWriteContract]
  );

  const applyForTask = useCallback(
    async (taskId: bigint) => {
      const contract = await getWriteContract();
      return contract.applyForTask(taskId);
    },
    [getWriteContract]
  );

  const submitWork = useCallback(
    async (taskId: bigint, deliveryHash: string, deliveryURI: string) => {
      const contract = await getWriteContract();
      return contract.submitWork(taskId, deliveryHash, deliveryURI);
    },
    [getWriteContract]
  );

  const approveAndRelease = useCallback(
    async (taskId: bigint) => {
      const contract = await getWriteContract();
      return contract.approveAndRelease(taskId);
    },
    [getWriteContract]
  );

  const cancelTask = useCallback(
    async (taskId: bigint) => {
      const contract = await getWriteContract();
      return contract.cancelTask(taskId);
    },
    [getWriteContract]
  );

  return {
    createTask,
    fundTask,
    assignFreelancer,
    applyForTask,
    submitWork,
    approveAndRelease,
    cancelTask,
    invalidateTasks
  };
}

export function useTaskCount() {
  return useQuery({
    queryKey: ["escrow", "taskCount"],
    enabled: isEscrowConfigured,
    structuralSharing: false,
    queryFn: async () => {
      const contract = getReadEscrowContract();
      return contract.getTaskCount();
    }
  });
}

export function useTask(taskId: bigint | null) {
  return useQuery({
    queryKey: ["escrow", "task", taskId?.toString()],
    enabled: isEscrowConfigured && taskId !== null,
    structuralSharing: false,
    queryFn: async () => {
      if (taskId === null) {
        throw new Error("Missing task ID.");
      }

      const contract = getReadEscrowContract();
      return mapTask(await contract.getTask(taskId));
    }
  });
}

export function useTaskApplicants(taskId: bigint | null) {
  return useQuery({
    queryKey: ["escrow", "task", taskId?.toString(), "applicants"],
    enabled: isEscrowConfigured && taskId !== null,
    structuralSharing: false,
    queryFn: async () => {
      if (taskId === null) {
        throw new Error("Missing task ID.");
      }

      const contract = getReadEscrowContract();
      try {
        const applicants = await contract.getApplicants(taskId);
        return Array.from(applicants);
      } catch {
        return [];
      }
    }
  });
}

export function useHasApplied(taskId: bigint | null, freelancer: string | null) {
  return useQuery({
    queryKey: ["escrow", "task", taskId?.toString(), "hasApplied", freelancer],
    enabled: isEscrowConfigured && taskId !== null && Boolean(freelancer),
    structuralSharing: false,
    queryFn: async () => {
      if (taskId === null || !freelancer) {
        return false;
      }

      const contract = getReadEscrowContract();
      try {
        return await contract.hasApplied(taskId, freelancer);
      } catch {
        return false;
      }
    }
  });
}

export function useRecentTasks() {
  const taskCountQuery = useTaskCount();

  return useQuery({
    queryKey: ["escrow", "tasks", taskCountQuery.data?.toString()],
    enabled: isEscrowConfigured && taskCountQuery.data !== undefined,
    structuralSharing: false,
    queryFn: async () => {
      const count = taskCountQuery.data ?? 0n;
      const contract = getReadEscrowContract();
      const ids = Array.from({ length: Number(count) }, (_, index) => BigInt(index)).reverse();
      const tasks = await Promise.all(ids.map(async (id) => mapTask(await contract.getTask(id))));

      return tasks;
    }
  });
}
