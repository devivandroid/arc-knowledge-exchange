import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { calculateReputation, getUniqueWallets } from "@/lib/server/reputation/calculateReputation";
import { getEvents } from "@/lib/server/reputation/reputationEventStore";
import { maskWallet } from "@/lib/server/reputation/reputationResponse";
import { ReputationLookup } from "@/app/reputation/ReputationLookup";
import { getAppBaseUrl } from "@/lib/getAppBaseUrl";

export default function ReputationPage() {
  const appBaseUrl = getAppBaseUrl();
  const events = getEvents();
  const summaries = getUniqueWallets(events)
    .map((wallet) => calculateReputation(wallet, events))
    .sort((a, b) => b.reputationScore - a.reputationScore);
  const totalVolume = summaries.reduce((sum, summary) => sum + Number(summary.totalVolumeUSDC), 0);
  const verifiedPayments = events.filter((event) => event.eventType === "PAYMENT_VERIFIED").length;
  const completedEscrows = events.filter((event) => event.eventType === "FUNDS_RELEASED").length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Risk API"
        title="Agent Risk API"
        description="Risk and reputation signals for wallets and agents participating in programmable commerce on Arc."
      />

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Wallets tracked", summaries.length],
          ["Total volume", `${totalVolume.toFixed(2)} USDC`],
          ["Verified payments", verifiedPayments],
          ["Completed escrows", completedEscrows]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-arc-border bg-arc-panel/80 p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-lg border border-arc-border bg-arc-panel/80 p-5">
        <h2 className="text-xl font-semibold text-white">Wallet risk profiles</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Preview wallet risk profiles based only on Knowledge Exchange activity. This is not an
          official Arc or Circle score.
        </p>
        <div className="mt-4 overflow-hidden rounded-lg border border-arc-border">
          {summaries.map((summary) => (
            <div
              key={summary.wallet}
              className="grid gap-3 border-b border-arc-border bg-black/20 p-4 text-sm last:border-b-0 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr]"
            >
              <span className="font-semibold text-white">{maskWallet(summary.wallet)}</span>
              <span>Score {summary.reputationScore}</span>
              <span>{summary.riskTier} risk</span>
              <span>{summary.confidenceLevel} confidence</span>
              <span>{summary.totalVolumeUSDC} USDC</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6">
        <ReputationLookup />
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-arc-border bg-arc-panel/80 p-5">
          <h2 className="text-xl font-semibold text-white">Methodology</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            The financial behavior score starts at 500 and moves up for successful purchases,
            verified payments, downloads, funded escrows, submitted deliveries and released funds.
            The preview model penalizes cancelled requests and started purchases that do not
            complete. Volume adds capped positive weight.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Risk tiers are intentionally simple: Low requires a strong score and enough evidence,
            Medium covers mixed but usable history, High flags weak or negative event patterns, and
            Unknown means there is not enough activity.
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Reputation remains part of the underlying signal model, but the product surface is a
            Risk API for builders that need wallet risk profiles, confidence levels and explainable
            behavior signals.
          </p>
        </div>

        <div className="rounded-lg border border-arc-border bg-arc-panel/80 p-5">
          <h2 className="text-xl font-semibold text-white">Risk API docs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Builders, human operators and AI agents can query a wallet risk profile, inspect recent
            marketplace events and read the model methodology.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300">
            {`curl ${appBaseUrl}/api/reputation/0x...
curl ${appBaseUrl}/api/reputation?limit=10
curl ${appBaseUrl}/api/reputation/events
curl ${appBaseUrl}/api/reputation/model`}
          </pre>
          <p className="mt-3 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
            Scope limitation: this is a preview risk model based on Knowledge Exchange activity
            only. It is not an official Arc or Circle score and does not score all Arc wallets.
            Future versions should add Arc-wide indexing.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
