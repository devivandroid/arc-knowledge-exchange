"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/web3";

export function ConnectWalletButton() {
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
    switchToArcTestnet
  } = useWallet();

  const handleConnect = async () => {
    if (address) {
      setIsMenuOpen((currentValue) => !currentValue);
      return;
    }

    await connect();
  };

  const handleDisconnect = () => {
    disconnect();
    setIsMenuOpen(false);
  };

  const handleCopyAddress = async () => {
    if (!address) {
      return;
    }

    await navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    window.setTimeout(() => setCopiedAddress(false), 1400);
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
          onClick={handleConnect}
          disabled={isConnecting || !isMetaMaskAvailable}
          className="rounded-lg border border-arc-border bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-arc-blue hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Connect wallet"
          title={isMetaMaskAvailable ? "MetaMask detected" : "Install MetaMask to connect"}
        >
          {address ? `🦊 Connected wallet ▾` : isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
        {address && isMenuOpen ? (
          <div className="absolute right-0 top-11 z-50 w-64 rounded-lg border border-arc-border bg-[#242424] p-2 shadow-glow">
            <div className="rounded-md bg-black/20 px-3 py-2">
              <p className="flex items-center gap-2 truncate text-sm font-semibold text-slate-100">
                <span aria-hidden="true">🦊</span>
                <span>{shortenAddress(address)}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyAddress}
              className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <span aria-hidden="true">⧉</span>
              {copiedAddress ? "Copied" : "Copy Wallet Address"}
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
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
