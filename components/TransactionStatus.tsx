import { getExplorerTxUrl } from "@/lib/web3";

export type TransactionPhase =
  | "idle"
  | "signature"
  | "submitted"
  | "confirming"
  | "success"
  | "error";

export type TransactionState = {
  phase: TransactionPhase;
  hash?: string;
  message?: string;
};

const phaseLabel: Record<TransactionPhase, string> = {
  idle: "Ready",
  signature: "Pending signature",
  submitted: "Transaction submitted",
  confirming: "Confirmation pending",
  success: "Success",
  error: "Failure"
};

type TransactionStatusProps = {
  state: TransactionState;
};

export function TransactionStatus({ state }: TransactionStatusProps) {
  if (state.phase === "idle" && !state.message) {
    return null;
  }

  const isError = state.phase === "error";

  return (
    <div
      className={`rounded-lg border p-4 text-sm ${
        isError
          ? "border-red-400/40 bg-red-400/10 text-red-100"
          : "border-arc-border bg-white/5 text-slate-200"
      }`}
    >
      <p className="font-semibold">{phaseLabel[state.phase]}</p>
      {state.message ? <p className="mt-1 text-slate-300">{state.message}</p> : null}
      {state.hash ? (
        <a
          href={getExplorerTxUrl(state.hash)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex text-arc-blue hover:text-white"
        >
          View on Arc Explorer
        </a>
      ) : null}
    </div>
  );
}
