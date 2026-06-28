"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

type ReputationLookupResult = {
  ok: boolean;
  wallet: string;
  dataSource?: "knowledge_exchange" | "arc_network" | "combined" | "no_data";
  profileStatus?: "active" | "limited" | "no_data";
  message?: string;
  recommendation?: string;
  participant?: {
    type: string;
    name: string | null;
    operatorAddress: string | null;
  };
  scores?: {
    financialBehaviorScore: number | null;
    riskScore: number | null;
    riskTier: string;
    confidenceLevel: string;
  };
  activity?: {
    totalCompletedVolumeUSDC: string;
    completedActions: number;
    successfulPayments: number;
    failedPayments: number;
    resourcesPurchased: number;
    resourcesDownloaded: number;
    requestsCreated: number;
    protectedTransactionsFunded: number;
    deliveriesSubmitted: number;
    fundsReleased: number;
    uniqueCounterparties: number;
    averageTransactionAmountUSDC: string;
    averageActionsPerDay: string;
    lastActivity: string | null;
    daysSinceLastActivity: number | null;
    evidenceCount: number;
    activityLevel: string;
  };
  metadata?: {
    dataFreshness?: string;
    lastIndexed?: string;
    cacheSource?: string;
    coverage?: {
      fromBlock?: number;
      toBlock?: number;
      blocksAnalyzed?: number;
      fullHistory?: boolean;
      description?: string;
    };
  };
  behavioralSignals?: Array<{
    label: string;
    value: string;
    status: string;
  }>;
  riskSignals?: Array<{
    label: string;
    severity: string;
    description: string;
  }>;
  reputationScore: number | null;
  financialRiskScore: number | null;
  riskTier: string;
  confidenceLevel: string;
  metrics: {
    totalVolumeUSDC: string;
    successfulPayments: number;
    resourcesPurchased: number;
    resourcesDownloaded: number;
    escrowsFunded: number;
    protectedTransactionsFunded?: number;
    fundsReleased: number;
    paymentSuccessRate: number;
    evidenceCount: number;
  };
  lastActivity: string | null;
  limitations: string[];
};

type RiskSource = "internal" | "arc_network" | "combined";

type RiskBreakdown = {
  internal: ReputationLookupResult | null;
  network: ReputationLookupResult | null;
};

const sourceOptions: Array<{ value: RiskSource; label: string; description: string }> = [
  {
    value: "internal",
    label: "Internal",
    description: "KX activity"
  },
  {
    value: "arc_network",
    label: "Arc Network",
    description: "Arc Testnet RPC signals"
  },
  {
    value: "combined",
    label: "Combined",
    description: "Internal + network context"
  }
];

function getRiskAccent(tier: string): string {
  if (tier === "Low") return "border-emerald-300/40 bg-emerald-300/10 text-emerald-100";
  if (tier === "Medium") return "border-amber-300/40 bg-amber-300/10 text-amber-100";
  if (tier === "High") return "border-red-300/40 bg-red-300/10 text-red-100";
  return "border-slate-400/30 bg-slate-400/10 text-slate-300";
}

function formatNullableScore(value: number | null | undefined): string {
  return value === null || value === undefined ? "Not assessed" : String(value);
}

function getStatusAccent(status: string): string {
  if (status === "Normal") return "text-emerald-200";
  if (status === "Watch" || status === "Monitor") return "text-amber-200";
  if (status === "Elevated") return "text-red-200";
  return "text-slate-400";
}

function formatDate(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString() : "Unknown";
}

function formatKXLastActivity(value: string | null | undefined): string {
  return value ? formatDate(value) : "No KX activity yet";
}

function formatUSDC(value: string | number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "0.00 USDC";

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: amount < 1 ? 6 : 2,
    minimumFractionDigits: 2
  }).format(amount)} USDC`;
}

function formatDaysSinceLastActivity(value: number | null | undefined): string {
  if (typeof value !== "number") return "Unavailable";
  if (value === 0) return "Today";
  if (value === 1) return "1 day";
  return `${value} days`;
}

function getBehavioralSignalValue(
  profile: ReputationLookupResult | null,
  label: string
): string {
  return profile?.behavioralSignals?.find((signal) => signal.label === label)?.value ?? "Unavailable";
}

function getVisibleBehavioralSignals(result: ReputationLookupResult) {
  return (result.behavioralSignals ?? []).filter(
    (signal) =>
      signal.label !== "RPC account nonce" &&
      signal.label !== "Arc Network: RPC account nonce"
  );
}

export function ReputationLookup() {
  const [wallet, setWallet] = useState("");
  const [source, setSource] = useState<RiskSource>("combined");
  const [result, setResult] = useState<ReputationLookupResult | null>(null);
  const [breakdown, setBreakdown] = useState<RiskBreakdown>({ internal: null, network: null });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const lookup = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setBreakdown({ internal: null, network: null });

    try {
      const endpoint =
        source === "arc_network"
          ? `/api/risk/network/${wallet}`
          : `/api/risk/profile/${wallet}?source=${source}`;
      const [response, internalResponse, networkResponse] = await Promise.all([
        fetch(endpoint),
        fetch(`/api/risk/profile/${wallet}?source=internal`),
        fetch(`/api/risk/network/${wallet}`)
      ]);
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || body.error || "Lookup failed.");
      }

      const [internalBody, networkBody] = await Promise.all([
        internalResponse.ok ? internalResponse.json() : Promise.resolve(null),
        networkResponse.ok ? networkResponse.json() : Promise.resolve(null)
      ]);

      setResult(body);
      setBreakdown({
        internal: internalBody,
        network: networkBody
      });
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
        Query Risk Intelligence using internal activity, Arc Testnet RPC signals, or a combined view.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {sourceOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSource(option.value)}
            className={`rounded-lg border px-3 py-2 text-left transition ${
              source === option.value
                ? "border-arc-blue bg-arc-blue/15 text-white"
                : "border-arc-border bg-black/20 text-slate-400 hover:border-slate-500"
            }`}
          >
            <span className="block text-sm font-semibold">{option.label}</span>
            <span className="mt-1 block text-xs">{option.description}</span>
          </button>
        ))}
      </div>
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
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-arc-blue px-5 py-3 text-sm font-semibold text-arc-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <LoadingSpinner /> : null}
          {loading ? "Checking..." : "Check Risk Intelligence"}
        </button>
      </div>
      {error ? (
        <p className="mt-3 rounded-lg border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      {result ? (
        <div className="mt-4 grid gap-5 rounded-lg border border-arc-border bg-black/20 p-4 text-sm">
          {result.profileStatus === "no_data" ? (
            <div className="rounded-lg border border-sky-300/25 bg-sky-300/10 p-4">
              <p className="font-semibold text-sky-100">
                No KX activity found
              </p>
              <p className="mt-2 leading-6 text-slate-300">
                This wallet has no activity in KX yet. Risk cannot be
                assessed from marketplace data alone.
              </p>
              <p className="mt-3 rounded-lg border border-slate-500/30 bg-black/20 p-3 text-sm font-medium text-slate-200">
                Missing data is not the same as high risk.
              </p>
              <p className="mt-2 leading-6 text-slate-400">
                Use review mode, request additional verification, or apply your own risk
                policy before transacting.
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">
                {result.participant?.name
                  ? `${result.participant.name} · ${result.participant.type}`
                  : result.participant?.type === "unknown"
                    ? "Unknown participant type"
                    : result.participant?.type}
              </p>
              <p className="mt-1 break-all text-xs text-slate-500">{result.wallet}</p>
              <p className="mt-1 text-xs uppercase tracking-normal text-slate-500">
                Data source: {result.dataSource ?? "knowledge_exchange"}
              </p>
              {result.participant?.operatorAddress ? (
                <p className="mt-1 break-all text-xs text-slate-500">
                  Operator: {result.participant.operatorAddress}
                </p>
              ) : null}
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getRiskAccent(
                result.riskTier
              )}`}
            >
              {result.riskTier} risk
            </span>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">Data Breakdown</p>
            {breakdown.internal?.profileStatus === "no_data" &&
            breakdown.network?.profileStatus !== "no_data" ? (
              <p className="mt-3 rounded-lg border border-sky-300/25 bg-sky-300/10 p-3 text-sm font-medium text-sky-100">
                Arc Network Data only. No KX marketplace activity found.
              </p>
            ) : null}
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-arc-border bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">KX Data</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Marketplace, purchases, requests, deliveries and ratings.
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-500/40 px-2 py-1 text-xs text-slate-300">
                    {breakdown.internal?.profileStatus ?? "no_data"}
                  </span>
                </div>
                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 pb-2">
                    <dt className="text-slate-500">Completed volume</dt>
                    <dd className="font-medium text-slate-200">
                      {formatUSDC(breakdown.internal?.activity?.totalCompletedVolumeUSDC)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                    <dt className="text-slate-500">Completed actions</dt>
                    <dd className="font-medium text-slate-200">
                      {breakdown.internal?.activity?.completedActions ?? 0}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 pt-2">
                    <dt className="text-slate-500">Last activity</dt>
                    <dd className="font-medium text-slate-200">
                      {formatKXLastActivity(breakdown.internal?.activity?.lastActivity)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border border-arc-border bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Arc Network</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Arcscan API counters plus KX on-demand USDC Transfer indexing.
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-500/40 px-2 py-1 text-xs text-slate-300">
                    {breakdown.network?.profileStatus ?? "no_data"}
                  </span>
                </div>
                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 pb-2">
                    <dt className="text-slate-500">Native USDC balance</dt>
                    <dd className="font-medium text-slate-200">
                      {getBehavioralSignalValue(breakdown.network, "Native USDC balance")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                    <dt className="text-slate-500">KX-indexed USDC volume</dt>
                    <dd className="font-medium text-slate-200">
                      {formatUSDC(breakdown.network?.activity?.totalCompletedVolumeUSDC)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                    <dt className="text-slate-500">Arcscan API transactions</dt>
                    <dd className="font-medium text-slate-200">
                      {getBehavioralSignalValue(breakdown.network, "Transactions indexed")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                    <dt className="text-slate-500">Arcscan API transfers</dt>
                    <dd className="font-medium text-slate-200">
                      {getBehavioralSignalValue(breakdown.network, "Transfers indexed")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                    <dt className="text-slate-500">Arcscan API gas used</dt>
                    <dd className="font-medium text-slate-200">
                      {getBehavioralSignalValue(breakdown.network, "Gas used")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                    <dt className="text-slate-500">Data freshness</dt>
                    <dd className="font-medium text-slate-200">
                      {breakdown.network?.metadata?.dataFreshness ?? "Unavailable"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                    <dt className="text-slate-500">Last indexed</dt>
                    <dd className="font-medium text-slate-200">
                      {formatDate(breakdown.network?.metadata?.lastIndexed)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                    <dt className="text-slate-500">Cache source</dt>
                    <dd className="font-medium text-slate-200">
                      {breakdown.network?.metadata?.cacheSource ?? "Unavailable"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                    <dt className="text-slate-500">Block range</dt>
                    <dd className="font-medium text-slate-200">
                      {getBehavioralSignalValue(breakdown.network, "Block range analyzed")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                    <dt className="text-slate-500">Coverage</dt>
                    <dd className="font-medium text-slate-200">
                      {breakdown.network?.metadata?.coverage?.blocksAnalyzed
                        ? `${breakdown.network.metadata.coverage.blocksAnalyzed} blocks; full history: ${
                            breakdown.network.metadata.coverage.fullHistory ? "yes" : "no"
                          }`
                        : "Unavailable"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 pt-2">
                    <dt className="text-slate-500">Network activity level</dt>
                    <dd className="font-medium text-slate-200">
                      {breakdown.network?.activity?.activityLevel ?? "Unknown"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Financial Behavior Score", result.scores?.financialBehaviorScore ?? result.reputationScore],
              ["Risk Score", result.scores?.riskScore ?? result.financialRiskScore],
              ["Risk Tier", result.scores?.riskTier ?? result.riskTier],
              ["Confidence", result.scores?.confidenceLevel ?? result.confidenceLevel],
              [
                "Completed Volume",
                formatUSDC(result.activity?.totalCompletedVolumeUSDC ?? result.metrics.totalVolumeUSDC)
              ],
              ["Indexed network actions", result.activity?.completedActions ?? 0],
              ["Last Activity", formatDate(result.activity?.lastActivity ?? result.lastActivity)],
              ["Activity Level", result.activity?.activityLevel ?? "Unknown"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-arc-border bg-white/[0.03] p-3">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-1 text-base font-semibold text-white">
                  {typeof value === "number" || value === null || value === undefined
                    ? formatNullableScore(value)
                    : value}
                </dd>
              </div>
            ))}
          </dl>

          <div>
            <p className="text-sm font-semibold text-white">Activity Profile</p>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Network transactions", result.activity?.successfulPayments ?? result.metrics.successfulPayments],
                ["Failed payments", result.activity?.failedPayments ?? 0],
                ["Resources purchased", result.activity?.resourcesPurchased ?? result.metrics.resourcesPurchased],
                ["Resources downloaded", result.activity?.resourcesDownloaded ?? result.metrics.resourcesDownloaded],
                ["Requests created", result.activity?.requestsCreated ?? 0],
                [
                  "Protected transactions funded",
                  result.activity?.protectedTransactionsFunded ??
                    result.metrics.protectedTransactionsFunded ??
                    result.metrics.escrowsFunded
                ],
                ["Deliveries submitted", result.activity?.deliveriesSubmitted ?? 0],
                ["Funds released", result.activity?.fundsReleased ?? result.metrics.fundsReleased],
                ["Unique counterparties", result.activity?.uniqueCounterparties ?? 0],
                [
                  "Average transaction",
                  formatUSDC(result.activity?.averageTransactionAmountUSDC)
                ],
                ["Average actions/day", result.activity?.averageActionsPerDay ?? "0.0"],
                [
                  "Days since last activity",
                  formatDaysSinceLastActivity(result.activity?.daysSinceLastActivity)
                ],
                ["Evidence count", result.activity?.evidenceCount ?? result.metrics.evidenceCount]
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-arc-border/60 py-2">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium text-slate-200">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-white">Behavioral Signals</p>
              <div className="mt-3 grid gap-2">
                {getVisibleBehavioralSignals(result).map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-lg border border-arc-border bg-white/[0.03] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{signal.label}</p>
                      <span className={`text-xs font-semibold ${getStatusAccent(signal.status)}`}>
                        {signal.status}
                      </span>
                    </div>
                    <p className="mt-1 text-slate-400">{signal.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">Risk Signals</p>
              <div className="mt-3 grid gap-2">
                {(result.riskSignals ?? []).map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-lg border border-arc-border bg-white/[0.03] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{signal.label}</p>
                      <span className={`text-xs font-semibold ${getStatusAccent(signal.severity)}`}>
                        {signal.severity}
                      </span>
                    </div>
                    <p className="mt-1 leading-5 text-slate-400">{signal.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
