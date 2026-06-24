"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/web3";

export function WalletMenuButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const {
    address,
    chainId,
    isArcTestnet,
    isConnecting,
    isMetaMaskAvailable,
    error,
    connect,
    disconnect,
    refreshSelectedAccount,
    requestAccountSelection,
    switchToArcTestnet
  } = useWallet();

  const handleMainClick = async () => {
    if (address) {
      setIsMenuOpen((currentValue) => !currentValue);
      return;
    }

    await connect();
  };

  const handleCopyAddress = async () => {
    if (!address) {
      return;
    }

    await navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    window.setTimeout(() => setCopiedAddress(false), 1400);
  };

  const handleSignOut = () => {
    disconnect();
    setIsMenuOpen(false);
  };

  const handleRefresh = async () => {
    await refreshSelectedAccount();
  };

  const handleSwitchAccount = async () => {
    await requestAccountSelection();
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="relative flex items-center gap-2">
        {address && !isArcTestnet ? (
          <button
            type="button"
            onClick={switchToArcTestnet}
            disabled={isConnecting}
            className="rounded-lg border border-amber-400/60 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Switch to Arc Testnet
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleMainClick}
          disabled={isConnecting || !isMetaMaskAvailable}
          className="rounded-lg border border-arc-border bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-arc-blue hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Connect wallet"
          title={isMetaMaskAvailable ? "MetaMask detected" : "Install MetaMask to connect"}
        >
          {address ? (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true">🦊</span>
              <span>{shortenAddress(address)}</span>
              <span aria-hidden="true">▾</span>
            </span>
          ) : isConnecting ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner />
              Connecting...
            </span>
          ) : (
            "Connect Wallet"
          )}
        </button>

        {address && isMenuOpen ? (
          <div className="absolute right-0 top-11 z-50 w-64 rounded-lg border border-arc-border bg-[#242424] p-2 shadow-glow">
            <div className="flex items-center justify-between gap-3 rounded-md bg-black/20 px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Connected wallet</p>
                <p className="mt-1 flex items-center gap-2 truncate text-sm font-semibold text-slate-100">
                  <span aria-hidden="true">🦊</span>
                  <span>{shortenAddress(address)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isConnecting}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 text-slate-300 transition hover:border-arc-blue hover:text-arc-blue disabled:cursor-not-allowed disabled:opacity-50"
                title="Refresh account"
                aria-label="Refresh account"
              >
                {isConnecting ? <LoadingSpinner /> : "↻"}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSwitchAccount}
              disabled={isConnecting}
              className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              {isConnecting ? <LoadingSpinner /> : <span aria-hidden="true">⇄</span>}
              Switch Account
            </button>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <span aria-hidden="true">⧉</span>
              {copiedAddress ? "Copied" : "Copy Wallet Address"}
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-300 transition hover:bg-red-400/10"
            >
              <span aria-hidden="true">↪</span>
              Sign Out
            </button>
          </div>
        ) : null}
      </div>

      {address && chainId ? (
        <p className="hidden text-xs text-slate-500 sm:block">
          {isArcTestnet ? "Arc Testnet" : `Wrong network (${chainId})`}
        </p>
      ) : null}
      {error ? <p className="max-w-72 text-right text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
