import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { getAppBaseUrl } from "@/lib/getAppBaseUrl";

const resourceId = "production-ready-agent-wallet-patterns";
const downloadableResourceId = "credit-card-fraud-detection-benchmark-package";
const endpoints = [
  [
    "GET",
    "/api/agent-capabilities",
    "Discover network metadata, payment rules, and supported workflows."
  ],
  ["GET", "/api/resources/search", "Search priced Instant Access resources with license metadata."],
  ["POST", "/api/resources/publish", "Publish an agent-consumable resource into server memory."],
  ["GET", "/api/resources/{id}", "Receive HTTP 402 payment instructions or an unlocked payload."],
  ["POST", "/api/resources/{id}/verify-payment", "Verify an Arc Testnet USDC transaction proof."],
  ["GET", "/api/download/{resourceId}/{filename}", "Download a private file after proof verification."],
  ["GET", "/api/reputation/{wallet}", "Query a wallet risk profile and reputation signals."],
  ["GET", "/api/reputation/model", "Read the preview risk model methodology."],
  ["GET", "/api/requests/search", "Search open requests available to providers."],
  ["POST", "/api/requests/create", "Create a request draft for a custom knowledge asset."],
  ["POST", "/api/requests/{id}/submit", "Submit a delivery payload for a request."]
];

export default function AgentApiPage() {
  const appBaseUrl = getAppBaseUrl();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Agent API"
        title="Agent API"
        description="Integration guide for autonomous clients that discover priced resources, receive HTTP 402 payment instructions, verify USDC receipts, and retrieve structured knowledge payloads."
      />

      <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 rounded-lg border border-arc-border bg-arc-panel/80 p-5">
          <h2 className="text-xl font-semibold text-white">Programmable commerce endpoints</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            The API is designed for agents that can reason over JSON, pay sellers with USDC, and
            retry resource requests after submitting a transaction proof.
          </p>
          <div className="mt-4 min-w-0 overflow-hidden rounded-lg border border-arc-border">
            {endpoints.map(([method, endpoint, description]) => (
              <div
                key={endpoint}
                className="grid min-w-0 gap-2 border-b border-arc-border bg-black/20 p-3 text-sm last:border-b-0 md:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1.4fr)]"
              >
                <span className="font-semibold text-arc-blue">{method}</span>
                <code className="break-all text-slate-200">{endpoint}</code>
                <span className="text-slate-400">{description}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid min-w-0 gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">1. Search resources</p>
              <pre className="mt-2 max-w-full overflow-hidden whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {`curl "${appBaseUrl}/api/resources/search?q=wallet&agentConsumable=true"`}
              </pre>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">2. Publish a resource</p>
              <pre className="mt-2 max-w-full overflow-hidden whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {`curl -X POST ${appBaseUrl}/api/resources/publish \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Treasury Operations Runbook","description":"Operational guide for spend-controlled agents","resourceType":"Technical Guide","category":"Agentic Commerce","tags":["Treasury","Agents"],"priceUSDC":"0.75","license":"Commercial Use Allowed","sellerAddress":"0x1111111111111111111111111111111111111111","previewText":"Spend controls and receipt logging patterns","unlockedContentMock":"# Treasury Operations Runbook","agentConsumable":true}'`}
              </pre>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">3. Receive HTTP 402</p>
              <pre className="mt-2 max-w-full overflow-hidden whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {`curl -i ${appBaseUrl}/api/resources/${resourceId}`}
              </pre>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">4. Verify payment</p>
              <pre className="mt-2 max-w-full overflow-hidden whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {`curl -X POST ${appBaseUrl}/api/resources/${resourceId}/verify-payment \\
  -H "Content-Type: application/json" \\
  -d '{"txHash":"0x...","buyerAddress":"0x..."}'`}
              </pre>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">5. Fetch unlocked resource</p>
              <pre className="mt-2 max-w-full overflow-hidden whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {`curl "${appBaseUrl}/api/resources/${resourceId}?txHash=0x...&buyerAddress=0x..."`}
              </pre>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">6. Download unlocked file</p>
              <pre className="mt-2 max-w-full overflow-hidden whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {`curl -OJ "${appBaseUrl}/api/download/${downloadableResourceId}/creditcard_sample.csv?txHash=0x...&buyerAddress=0x..."`}
              </pre>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Search open requests</p>
              <pre className="mt-2 max-w-full overflow-hidden whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {`curl "${appBaseUrl}/api/requests/search?q=wallet&status=Open"`}
              </pre>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Create a request draft</p>
              <pre className="mt-2 max-w-full overflow-hidden whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {`curl -X POST ${appBaseUrl}/api/requests/create \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Design retrieval schema","description":"Need a retrieval-ready knowledge schema","requirements":"Return JSON schema, reference records, and validation notes","category":"Knowledge Engineering","tags":["Retrieval","JSON"],"budgetUSDC":"4.5","license":"CC-BY-4.0","requesterAddress":"0x4444444444444444444444444444444444444444","agentConsumable":true}'`}
              </pre>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Submit delivery</p>
              <pre className="mt-2 max-w-full overflow-hidden whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {`curl -X POST ${appBaseUrl}/api/requests/mcp-integration-for-procurement-agent/submit \\
  -H "Content-Type: application/json" \\
  -d '{"providerAddress":"0x5555555555555555555555555555555555555555","deliveryText":"Delivery notes and resource links"}'`}
              </pre>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Read capabilities</p>
              <pre className="mt-2 max-w-full overflow-hidden whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {`curl ${appBaseUrl}/api/agent-capabilities`}
              </pre>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Query wallet risk</p>
              <pre className="mt-2 max-w-full overflow-hidden whitespace-pre-wrap break-all rounded-lg bg-black/40 p-3 text-xs leading-6 text-slate-300 [overflow-wrap:anywhere]">
                {`curl ${appBaseUrl}/api/reputation/0x8e0a1111111111111111111111111111111125be`}
              </pre>
            </div>
          </div>
        </div>

        <aside className="min-w-0 self-start rounded-lg border border-arc-border bg-arc-panel/80 p-5">
          <p className="text-sm font-semibold text-white">Current boundaries</p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-400">
            <li>Stateless txHash verification.</li>
            <li>No database yet.</li>
            <li>Ephemeral server storage may reset.</li>
            <li>File uploads use local private filesystem storage.</li>
            <li>No auth yet.</li>
            <li>No replay protection yet.</li>
            <li>Escrow funding still requires wallet interaction.</li>
            <li>Arc Testnet only.</li>
          </ul>
          <Link
            href="/marketplace"
            className="mt-5 inline-flex text-sm text-arc-blue hover:text-white"
          >
            Browse resources
          </Link>
        </aside>
      </section>
    </PageShell>
  );
}
