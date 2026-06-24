import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "Knowledge Exchange Agent Risk API Model",
    scope: "Knowledge Exchange activity only",
    network: "Arc Testnet",
    positioning: [
      "Risk and reputation signals for programmable commerce on Arc",
      "Designed for Arc-based agent commerce",
      "Not an official Arc or Circle score",
      "Does not score all Arc wallets globally"
    ],
    scoring: {
      startingScore: 500,
      range: "0-1000",
      positiveSignals: [
        "successful purchases",
        "verified payments",
        "resource downloads",
        "escrow funding",
        "delivery submission",
        "funds released",
        "API unlock success"
      ],
      negativeSignals: [
        "cancelled requests",
        "purchase starts without completion"
      ],
      volumeBoost: "Adds capped points for observed USDC volume",
      confidence: {
        Low: "1-4 events",
        Medium: "5-11 events",
        High: "12+ events"
      },
      riskTiers: {
        Low: "score >= 750 and confidence is not Low",
        Medium: "score 500-749",
        High: "score below 500",
        Unknown: "no activity"
      }
    },
    limitations: [
      "MVP preview model",
      "Local/ephemeral event storage",
      "No dispute adjudication yet",
      "No verified agent identities yet",
      "Future roadmap: database, Arc-wide indexing, attestations and paid API tiers"
    ]
  });
}
