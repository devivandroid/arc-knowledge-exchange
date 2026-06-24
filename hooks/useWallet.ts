"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { BrowserProvider } from "ethers";
import { ARC_TESTNET_CHAIN_ID, isArcTestnetChainId } from "@/lib/chains/arcTestnet";
import {
  getBrowserProvider,
  hasInjectedWallet,
  normalizeWeb3Error,
  requestArcTestnet
} from "@/lib/web3";

type WalletContextValue = {
  address: string | null;
  chainId: number | null;
  isMetaMaskAvailable: boolean;
  isConnecting: boolean;
  isArcTestnet: boolean;
  error: string | null;
  provider: BrowserProvider | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshWalletState: () => Promise<void>;
  refreshSelectedAccount: () => Promise<void>;
  requestAccountSelection: () => Promise<void>;
  switchToArcTestnet: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);
const WALLET_CONNECTED_STORAGE_KEY = "knowledgeExchange:walletConnected";

type WalletProviderProps = {
  children: ReactNode;
};

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const refreshWalletState = useCallback(async () => {
    if (!window.ethereum?.request) {
      setProvider(null);
      setAddress(null);
      setChainId(null);
      return;
    }

    const chainIdHex = (await window.ethereum.request({ method: "eth_chainId" })) as string;
    setChainId(Number.parseInt(chainIdHex, 16));

    const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
    const [account] = accounts as string[];
    setAddress(account ?? null);
    setProvider(account ? getBrowserProvider() : null);
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const browserProvider = getBrowserProvider();

      if (!browserProvider) {
        throw new Error("MetaMask is not installed.");
      }

      await browserProvider.send("eth_requestAccounts", []);
      window.localStorage.setItem(WALLET_CONNECTED_STORAGE_KEY, "true");
      await refreshWalletState();
    } catch (walletError) {
      setError(normalizeWeb3Error(walletError));
    } finally {
      setIsConnecting(false);
    }
  }, [refreshWalletState]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setProvider(null);
    setError(null);
    window.localStorage.removeItem(WALLET_CONNECTED_STORAGE_KEY);
  }, []);

  const refreshSelectedAccount = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    try {
      await refreshWalletState();
    } catch (walletError) {
      setError(normalizeWeb3Error(walletError));
    } finally {
      setIsConnecting(false);
    }
  }, [refreshWalletState]);

  const requestAccountSelection = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    try {
      if (!window.ethereum?.request) {
        throw new Error("MetaMask is not installed.");
      }

      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
      });
      window.localStorage.setItem(WALLET_CONNECTED_STORAGE_KEY, "true");
      await refreshWalletState();
    } catch (walletError) {
      setError(normalizeWeb3Error(walletError));
    } finally {
      setIsConnecting(false);
    }
  }, [refreshWalletState]);

  const switchToArcTestnet = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    try {
      await requestArcTestnet();
      await refreshWalletState();
    } catch (walletError) {
      setError(normalizeWeb3Error(walletError));
    } finally {
      setIsConnecting(false);
    }
  }, [refreshWalletState]);

  useEffect(() => {
    setIsMetaMaskAvailable(hasInjectedWallet());
    const shouldRestoreWallet =
      window.localStorage.getItem(WALLET_CONNECTED_STORAGE_KEY) === "true";

    if (shouldRestoreWallet) {
      void refreshWalletState();
    }

    const handleAccountsChanged = () => {
      if (window.localStorage.getItem(WALLET_CONNECTED_STORAGE_KEY) === "true") {
        void refreshWalletState();
      }
    };

    const handleChainChanged = () => {
      if (window.localStorage.getItem(WALLET_CONNECTED_STORAGE_KEY) === "true") {
        void refreshWalletState();
      }
    };

    window.ethereum?.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum?.on?.("chainChanged", handleChainChanged);
    window.addEventListener("focus", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      window.removeEventListener("focus", handleAccountsChanged);
    };
  }, [refreshWalletState]);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      chainId,
      isMetaMaskAvailable,
      isConnecting,
      isArcTestnet: isArcTestnetChainId(chainId),
      error,
      provider,
      connect,
      disconnect,
      refreshWalletState,
      refreshSelectedAccount,
      requestAccountSelection,
      switchToArcTestnet
    }),
    [
      address,
      chainId,
      connect,
      disconnect,
      error,
      isConnecting,
      isMetaMaskAvailable,
      provider,
      refreshWalletState,
      refreshSelectedAccount,
      requestAccountSelection,
      switchToArcTestnet
    ]
  );

  return createElement(WalletContext.Provider, { value }, children);
}

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within WalletProvider.");
  }

  return context;
}

export function getExpectedArcChainId(): number {
  return ARC_TESTNET_CHAIN_ID;
}
