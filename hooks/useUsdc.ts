"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Contract,
  formatUnits,
  isAddress,
  parseUnits,
  type ContractTransactionResponse
} from "ethers";
import { useWallet } from "@/hooks/useWallet";
import { erc20Abi } from "@/lib/contracts/erc20";
import { escrowContractAddress, usdcAddress, usdcDecimals } from "@/lib/contracts/microWorkEscrow";
import { getReadOnlyProvider } from "@/lib/web3";

type Erc20Contract = Contract & {
  balanceOf: (account: string) => Promise<bigint>;
  allowance: (owner: string, spender: string) => Promise<bigint>;
  approve: (spender: string, amount: bigint) => Promise<ContractTransactionResponse>;
  transfer: (to: string, amount: bigint) => Promise<ContractTransactionResponse>;
};

function getReadUsdcContract(): Erc20Contract {
  const provider = getReadOnlyProvider();

  if (!provider) {
    throw new Error("Arc RPC URL is not configured.");
  }

  return new Contract(usdcAddress, erc20Abi, provider) as unknown as Erc20Contract;
}

export function useUsdc() {
  const { address, provider, isArcTestnet } = useWallet();
  const queryClient = useQueryClient();

  const balanceQuery = useQuery({
    queryKey: ["usdc", "balance", address],
    enabled: Boolean(address),
    queryFn: async () => {
      if (!address) {
        return 0n;
      }

      return getReadUsdcContract().balanceOf(address);
    }
  });

  const allowanceQuery = useQuery({
    queryKey: ["usdc", "allowance", address, escrowContractAddress],
    enabled: Boolean(address && escrowContractAddress),
    queryFn: async () => {
      if (!address || !escrowContractAddress) {
        return 0n;
      }

      return getReadUsdcContract().allowance(address, escrowContractAddress);
    }
  });

  const approve = useCallback(
    async (amountUsdc: string) => {
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
      const usdc = new Contract(usdcAddress, erc20Abi, signer) as unknown as Erc20Contract;

      return usdc.approve(escrowContractAddress, parseUnits(amountUsdc, usdcDecimals));
    },
    [isArcTestnet, provider]
  );

  const getBalance = useCallback(async (account: string) => {
    if (!isAddress(account)) {
      throw new Error("Invalid wallet address.");
    }

    return getReadUsdcContract().balanceOf(account);
  }, []);

  const transferUSDC = useCallback(
    async (to: string, amountUsdc: string) => {
      if (!isAddress(to)) {
        throw new Error("Invalid seller address.");
      }

      if (!provider) {
        throw new Error("Connect MetaMask first.");
      }

      if (!isArcTestnet) {
        throw new Error("Switch to Arc Testnet first.");
      }

      const amount = parseUnits(amountUsdc, usdcDecimals);

      if (address) {
        const currentBalance = await getReadUsdcContract().balanceOf(address);

        if (currentBalance < amount) {
          throw new Error("Insufficient USDC balance.");
        }
      }

      const signer = await provider.getSigner();
      const usdc = new Contract(usdcAddress, erc20Abi, signer) as unknown as Erc20Contract;

      return usdc.transfer(to, amount);
    },
    [address, isArcTestnet, provider]
  );

  const invalidateUsdc = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["usdc"] });
  }, [queryClient]);

  return {
    balance: balanceQuery.data ?? 0n,
    balanceUsdc: formatUnits(balanceQuery.data ?? 0n, usdcDecimals),
    allowance: allowanceQuery.data ?? 0n,
    allowanceUsdc: formatUnits(allowanceQuery.data ?? 0n, usdcDecimals),
    isLoading: balanceQuery.isLoading || allowanceQuery.isLoading,
    error: balanceQuery.error ?? allowanceQuery.error,
    approve,
    transferUSDC,
    getBalance,
    invalidateUsdc
  };
}
