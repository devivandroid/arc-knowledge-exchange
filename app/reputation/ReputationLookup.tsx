"use client";

import { useState } from "react";

type ReputationLookupResult = {
  ok: boolean;
  wallet: string;
  reputationScore: number;
  financialRiskScore: number;
  riskTier: string;
  confidenceLevel: string;
  metrics: {
    totalVolumeUSDC: string;
    successfulPayments: number;
    resourcesPurchased: number;
    resourcesDownloaded: number;
    escrowsFunded: number;
    fundsReleased: number;
    paymentSuccessRate: number;
    evidenceCount: number;
  };
  lastActivity: string | null;
  limitations: string[];
};

export function ReputationLookup() {
  const [wallet, setWallet] = useState("");
  const [result, setResult] = useState<ReputationLookupResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/reputation/${wallet}`);
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || body.error || "Lookup failed.");
      }
      setResult(body);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-arc-border bg-arc-panel/80 p-5">
      <h2 className="text-xl font-semibold text-white">Wallet lookup</h2>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Query a wallet risk profile based on Knowledge Exchange preview activity.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={wallet}
          onChange={(event) => setWallet(event.target.value)}
          placeholder="0x..."
          className="min-w-0 flex-1 rounded-lg border border-arc-border bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-arc-blue"
        />
        <button
          type="button"
          onClick={lookup}
          disabled={loading || !wallet.trim()}
          className="rounded-lg bg-arc-blue px-5 py-3 text-sm font-semibold text-arc-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Checking..." : "Check wallet risk"}
        </button>
      </div>
      {error ? (
        <p className="mt-3 rounded-lg border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      {result ? (
        <div className="mt-4 grid gap-3 rounded-lg border border-arc-border bg-black/20 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-white">{result.wallet}</p>
            <span className="rounded-full border border-arc-blue/40 bg-arc-blue/10 px-3 py-1 text-xs font-semibold text-arc-blue">
              {result.riskTier} risk
            </span>
          </div>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Behavior score</dt>
              <dd className="text-lg font-semibold text-white">{result.reputationScore}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Financial risk</dt>
              <dd className="text-lg font-semibold text-white">{result.financialRiskScore}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Confidence</dt>
              <dd className="text-lg font-semibold text-white">{result.confidenceLevel}</dd>
            </div>
          </dl>
          <p className="text-xs leading-5 text-slate-500">
            Volume: {result.metrics.totalVolumeUSDC} USDC - Evidence events:{" "}
            {result.metrics.evidenceCount}
          </p>
        </div>
      ) : null}
    </div>
  );
}
