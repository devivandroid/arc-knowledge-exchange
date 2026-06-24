import { BrowserProvider, JsonRpcProvider, isError, type Eip1193Provider } from "ethers";
import {
  ARC_TESTNET_CHAIN_ID,
  ARC_TESTNET_EXPLORER_URL,
  ARC_TESTNET_RPC_URL,
  ARC_TESTNET_WS_URL,
  ARC_TESTNET_USDC,
  arcTestnet,
  arcTestnetWalletParams
} from "@/lib/chains/arcTestnet";
import { env } from "@/lib/env";

export const arcRpcUrl = env.rpcUrl || ARC_TESTNET_RPC_URL;
export const arcWsUrl = env.wsUrl || ARC_TESTNET_WS_URL;
export const arcChainId = Number(env.chainId || ARC_TESTNET_CHAIN_ID);
export const arcExplorerUrl = env.explorerUrl || ARC_TESTNET_EXPLORER_URL;
export const arcUsdcToken = ARC_TESTNET_USDC;
export { arcTestnet };

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, listener: (...args: string[]) => void) => void;
      removeListener?: (event: string, listener: (...args: string[]) => void) => void;
    };
  }
}

export function hasInjectedWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export function getReadOnlyProvider(): JsonRpcProvider | null {
  if (!arcRpcUrl) {
    return null;
  }

  return new JsonRpcProvider(arcRpcUrl, arcChainId);
}

export function getBrowserProvider(): BrowserProvider | null {
  if (!hasInjectedWallet()) {
    return null;
  }

  const ethereum = window.ethereum;

  if (!ethereum) {
    return null;
  }

  return new BrowserProvider(ethereum);
}

export async function requestArcTestnet(): Promise<void> {
  if (!window.ethereum?.request) {
    throw new Error("MetaMask is not available.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: arcTestnet.chainIdHex }]
    });
  } catch (error) {
    const code = getWalletErrorCode(error);

    if (code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [arcTestnetWalletParams]
      });
      return;
    }

    throw error;
  }
}

export function getExplorerAddressUrl(address: string): string {
  return `${arcExplorerUrl}/address/${address}`;
}

export function getExplorerTxUrl(hash: string): string {
  return `${arcExplorerUrl}/tx/${hash}`;
}

export function shortenAddress(address: string): string {
  if (!address) {
    return "";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function normalizeWeb3Error(error: unknown): string {
  const code = getWalletErrorCode(error);

  if (code === 4001 || code === "ACTION_REJECTED") {
    return "Request rejected in wallet.";
  }

  if (isError(error, "CALL_EXCEPTION")) {
    return "Transaction reverted by the contract.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unexpected Web3 error.";
}

function getWalletErrorCode(error: unknown): number | string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const maybeError = error as {
    code?: number | string;
    info?: { error?: { code?: number | string } };
  };
  return maybeError.code ?? maybeError.info?.error?.code;
}
