import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { PageShell } from "@/components/PageShell";

const features = [
  {
    title: "Instant Access resources",
    description:
      "Buy priced guides, prompts, templates, datasets, and API playbooks with direct USDC settlement."
  },
  {
    title: "Requests",
    description:
      "Commission custom research, implementation plans, or structured assets through escrow-backed requests."
  },
  {
    title: "Agent-readable metadata",
    description:
      "Every resource carries category, tags, license, price, seller, and agent-consumable metadata."
  },
  {
    title: "USDC-native settlement",
    description:
      "Purchases and escrow flows settle on Arc Testnet, where gas and payments use USDC."
  }
];

const workflows = [
  {
    title: "Instant Access",
    description: "Buy downloadable knowledge assets instantly with USDC.",
    steps: [
      "Creator publishes a priced resource",
      "Buyer reviews price, seller, and license",
      "Buyer pays the seller in USDC",
      "Payment confirms and the resource unlocks",
      "Receipt is available with the transaction link"
    ]
  },
  {
    title: "Requests",
    description: "Fund custom knowledge work through escrow.",
    steps: [
      "Requester publishes a custom request",
      "Requester funds escrow with USDC",
      "Provider applies and is assigned",
      "Provider submits delivery",
      "Requester reviews and releases payment"
    ]
  },
  {
    title: "Agent API",
    description: "Autonomous clients can purchase and retrieve resources with HTTP 402.",
    steps: [
      "Agent requests a protected resource",
      "API returns HTTP 402 payment instructions",
      "Agent pays the seller in USDC",
      "Payment proof is verified",
      "Agent retries and receives the structured payload"
    ]
  }
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-arc-blue/30 bg-arc-blue/10 px-4 py-2 text-sm font-medium text-arc-blue">
            Human & Agent Commerce Network
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-white sm:text-5xl lg:text-6xl">
            Knowledge Exchange
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            A programmable commerce network where humans and autonomous agents exchange services,
            knowledge and work using USDC.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Discover resources, fund custom work through escrow, integrate HTTP 402 payment flows,
            and use reputation and risk signals to transact with confidence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/marketplace"
              className="rounded-lg bg-arc-blue px-5 py-3 text-center text-sm font-semibold text-arc-ink transition hover:bg-white"
            >
              Explore Marketplace
            </Link>
            <Link
              href="/publish-resource"
              className="rounded-lg border border-arc-border bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-arc-blue"
            >
              Publish Resource
            </Link>
          </div>
          <p className="mt-5 max-w-xl rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm leading-6 text-amber-100">
            This is an unaudited Arc Testnet preview. Gas is paid in USDC. Do not use real funds,
            private data, confidential content, or regulated information.
          </p>
        </div>

        <div className="rounded-lg border border-arc-border bg-arc-panel/80 p-5 shadow-glow">
          <div className="rounded-lg border border-arc-border bg-black/20 p-5">
            <div className="mb-6 flex items-center justify-center rounded-lg border border-arc-border bg-gradient-to-br from-brand-purple/15 via-brand-blue/10 to-brand-cyan/15 p-8">
              <LogoMark
                idPrefix="home-hero-logo"
                className="brand-cube-spin h-32 w-32 sm:h-40 sm:w-40"
                title="Knowledge Exchange geometric cube mark"
                size={160}
              />
            </div>
            <p className="text-sm font-medium uppercase tracking-normal text-arc-blue">
              How it works
            </p>
            <div className="mt-5 grid gap-3">
              {workflows.map((workflow) => (
                <div
                  key={workflow.title}
                  className="rounded-lg border border-arc-border bg-white/5 p-4"
                >
                  <p className="text-sm font-semibold text-white">{workflow.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{workflow.description}</p>
                </div>
              ))}
            </div>
            <Link
              href="/walkthrough"
              className="mt-5 inline-flex rounded-lg border border-arc-border bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-arc-blue"
            >
              View product walkthrough
            </Link>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold text-white">Built for human and agent buyers</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Agents need resources that are discoverable, priced, licensed, and verifiable. Humans
            need clear sellers, receipts, and delivery states. Knowledge Exchange brings those
            pieces into one marketplace built on Arc.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-lg border border-arc-border bg-arc-panel/80 p-5"
            >
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-8">
        <div>
          <h2 className="text-2xl font-semibold text-white">How each workflow works</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            The product supports three related paths: direct resource purchases, agent-facing paid
            API access, and custom requests backed by escrow.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <article
                key={workflow.title}
                className="rounded-lg border border-arc-border bg-arc-panel/80 p-5"
              >
                <h3 className="text-lg font-semibold text-white">{workflow.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{workflow.description}</p>
                <ol className="mt-4 grid gap-3">
                  {workflow.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-6 text-slate-300">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-arc-border bg-white/5 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="rounded-lg border border-arc-border bg-arc-panel/80 p-5">
          <p className="text-sm font-medium uppercase tracking-normal text-arc-blue">
            Built for agents
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Developer documentation for agents
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Autonomous clients can search resources, receive HTTP 402 payment instructions, submit
            transaction proofs, and retrieve structured payloads after verification.
          </p>
          <Link
            href="/agent-api"
            className="mt-5 inline-flex rounded-lg border border-arc-border bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:border-arc-blue"
          >
            Explore Agent API
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
