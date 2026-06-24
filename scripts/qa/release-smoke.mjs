const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:3000";
const validResourceId = "production-ready-agent-wallet-patterns";
const downloadableResourceId = "credit-card-fraud-detection-benchmark-package";
const downloadableFilename = "creditcard_sample.csv";
const featuredDatasetId = "synthetic-agent-commerce-benchmark-dataset";
const featuredRiskDatasetId = "agent-financial-reputation-risk-benchmark";
const validTxHash = `0x${"1".repeat(64)}`;
const validBuyer = "0x5555555555555555555555555555555555555555";

const results = [];

function record(name, ok, details = "") {
  results.push({ name, ok, details });
  const prefix = ok ? "PASS" : "FAIL";
  console.log(`${prefix} ${name}${details ? ` - ${details}` : ""}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function hasNoStackTrace(payload) {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload);
  return !/Unhandled Runtime Error|Build Error|Runtime Error|stack trace/i.test(text);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "follow",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers ?? {})
    }
  });
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return { response, body: await response.json() };
  }

  return { response, body: await response.text() };
}

async function test(name, fn) {
  try {
    await fn();
    record(name, true);
  } catch (error) {
    record(name, false, error instanceof Error ? error.message : String(error));
  }
}

await test("GET /api/agent-capabilities exposes Arc metadata", async () => {
  const { response, body } = await request("/api/agent-capabilities");
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(body.network?.name === "Arc Testnet", "missing Arc Testnet name");
  assert(body.network?.chainId === 5042002, "wrong chainId");
  assert(body.network?.chainIdHex === "0x4CF4B2", "wrong chainId hex");
  assert(body.network?.nativeGasToken === "USDC", "wrong native gas token");
  assert(body.network?.usdcDecimals === 6, "wrong USDC decimals");
  assert(body.payment?.standard === "HTTP_402_USDC_TRANSFER", "missing payment standard");
  assert(
    body.capabilities?.some((capability) => capability.id === "downloadable_assets"),
    "missing downloadable assets capability"
  );
});

await test("GET /api/reputation returns leaderboard", async () => {
  const { response, body } = await request("/api/reputation?limit=5");
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(Array.isArray(body.wallets), "wallets must be an array");
  assert(body.wallets.length > 0, "expected seeded reputation wallets");
});

await test("GET /api/reputation/[wallet] returns wallet score", async () => {
  const { response, body } = await request(
    "/api/reputation/0x8e0a1111111111111111111111111111111125be"
  );
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(body.scope === "Knowledge Exchange activity only", "wrong reputation scope");
  assert(typeof body.reputationScore === "number", "missing reputation score");
});

await test("GET /api/reputation/events returns masked recent events", async () => {
  const { response, body } = await request("/api/reputation/events?limit=5");
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(Array.isArray(body.events), "events must be an array");
  assert(body.events[0]?.walletAddress?.includes("..."), "wallet should be masked");
});

await test("GET /api/reputation/model returns methodology", async () => {
  const { response, body } = await request("/api/reputation/model");
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(body.scope === "Knowledge Exchange activity only", "wrong model scope");
  assert(body.scoring?.startingScore === 500, "missing starting score");
});

await test("GET /api/resources/search returns resources", async () => {
  const { response, body } = await request("/api/resources/search?q=wallet&agentConsumable=true");
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(Array.isArray(body.resources), "resources must be an array");
  assert(
    body.resources.some((resource) => resource.id === validResourceId),
    "valid resource missing"
  );
});

await test("GET /api/resources/[id] returns HTTP 402 payment instructions", async () => {
  const { response, body } = await request(`/api/resources/${validResourceId}`);
  assert(response.status === 402, `expected 402, got ${response.status}`);
  assert(body.ok === false, "expected ok=false");
  assert(body.error === "PAYMENT_REQUIRED", "wrong error");
  assert(body.chainId === 5042002, "wrong chainId");
  assert(body.chainIdHex === "0x4CF4B2", "wrong chainIdHex");
  assert(body.paymentInstructions?.decimals === 6, "wrong payment decimals");
  assert(
    body.paymentVerificationEndpoint?.includes(validResourceId),
    "missing verification endpoint"
  );
  assert(hasNoStackTrace(body), "response leaked stack trace");
});

await test("GET downloadable resource exposes file metadata", async () => {
  const { response, body } = await request(`/api/resources/search?q=fraud`);
  assert(response.status === 200, `expected 200, got ${response.status}`);
  const resource = body.resources?.find((item) => item.id === downloadableResourceId);
  assert(resource, "downloadable resource missing");
  assert(resource.deliveryType === "download", "expected deliveryType=download");
  assert(Array.isArray(resource.files) && resource.files.length >= 5, "missing file metadata");
  assert(
    resource.files.some((file) => file.filename === downloadableFilename),
    "missing CSV metadata"
  );
});

await test("GET /api/resources/search exposes featured premium datasets", async () => {
  const { response, body } = await request("/api/resources/search?q=synthetic");
  assert(response.status === 200, `expected 200, got ${response.status}`);
  const commerce = body.resources?.find((item) => item.id === featuredDatasetId);
  const risk = body.resources?.find((item) => item.id === featuredRiskDatasetId);
  assert(commerce?.featured === true, "missing featured commerce dataset");
  assert(risk?.featured === true, "missing featured risk dataset");
  assert(commerce.deliveryType === "download", "commerce dataset must be downloadable");
  assert(risk.deliveryType === "download", "risk dataset must be downloadable");
  assert(commerce.files?.some((file) => file.filename === "agent_commerce_sample.csv"), "missing commerce CSV");
  assert(risk.files?.some((file) => file.filename === "agent_risk_scores.csv"), "missing risk CSV");
});

await test("GET downloadable resource returns deliveryType in 402", async () => {
  const { response, body } = await request(`/api/resources/${downloadableResourceId}`);
  assert(response.status === 402, `expected 402, got ${response.status}`);
  assert(body.deliveryType === "download", "expected deliveryType=download");
  assert(body.paymentInstructions?.amountUSDC === "18.00", "wrong downloadable price");
});

await test("GET download without proof requires payment", async () => {
  const { response, body } = await request(
    `/api/download/${downloadableResourceId}/${downloadableFilename}`
  );
  assert(response.status === 402, `expected 402, got ${response.status}`);
  assert(body.error === "PAYMENT_REQUIRED", "wrong error");
  assert(hasNoStackTrace(body), "response leaked stack trace");
});

await test("POST /api/resources/[id]/verify-payment rejects invalid JSON shape", async () => {
  const { response, body } = await request(`/api/resources/${validResourceId}/verify-payment`, {
    method: "POST",
    body: JSON.stringify({ txHash: 123, buyerAddress: null })
  });
  assert(response.status === 400, `expected 400, got ${response.status}`);
  assert(body.ok === false, "expected ok=false");
  assert(body.accessGranted === false, "expected accessGranted=false");
  assert(body.error === "INVALID_INPUT", "wrong error");
  assert(hasNoStackTrace(body), "response leaked stack trace");
});

await test("POST /api/resources/[id]/verify-payment rejects fake txHash gracefully", async () => {
  const { response, body } = await request(`/api/resources/${validResourceId}/verify-payment`, {
    method: "POST",
    body: JSON.stringify({ txHash: validTxHash, buyerAddress: validBuyer })
  });
  assert([402, 502].includes(response.status), `expected 402 or 502, got ${response.status}`);
  assert(body.ok === false, "expected ok=false");
  assert(body.accessGranted === false, "expected accessGranted=false");
  assert(typeof body.error === "string", "missing error code");
  assert(hasNoStackTrace(body), "response leaked stack trace");
});

await test("GET resource with invalid proof stays payment-required", async () => {
  const { response, body } = await request(
    `/api/resources/${validResourceId}?txHash=fake&buyerAddress=fake`
  );
  assert(response.status === 402, `expected 402, got ${response.status}`);
  assert(body.error === "PAYMENT_REQUIRED", "wrong error");
  assert(hasNoStackTrace(body), "response leaked stack trace");
});

await test("GET /api/requests/search returns requests", async () => {
  const { response, body } = await request("/api/requests/search?q=wallet&status=Open");
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(Array.isArray(body.requests), "requests must be an array");
});

await test("POST /api/resources/publish accepts valid body", async () => {
  const { response, body } = await request("/api/resources/publish", {
    method: "POST",
    body: JSON.stringify({
      title: `QA Resource ${Date.now()}`,
      description: "QA published resource",
      resourceType: "Technical Guide",
      category: "QA",
      tags: ["QA", "Arc"],
      priceUSDC: "1.25",
      license: "Commercial Use Allowed",
      sellerAddress: "0x1111111111111111111111111111111111111111",
      previewText: "QA preview",
      unlockedContentMock: "# QA payload",
      agentConsumable: true
    })
  });
  assert(response.status === 201, `expected 201, got ${response.status}`);
  assert(body.resource?.id, "missing resource id");
  assert(body.endpoint?.includes(body.resource.id), "missing endpoint");
});

await test("POST /api/resources/publish rejects invalid body", async () => {
  const { response, body } = await request("/api/resources/publish", {
    method: "POST",
    body: JSON.stringify({ title: "Bad" })
  });
  assert(response.status === 400, `expected 400, got ${response.status}`);
  assert(typeof body.error === "string", "missing error code");
  assert(hasNoStackTrace(body), "response leaked stack trace");
});

let createdRequestId = "mcp-integration-for-procurement-agent";

await test("POST /api/requests/create accepts valid body", async () => {
  const { response, body } = await request("/api/requests/create", {
    method: "POST",
    body: JSON.stringify({
      title: `Design a support-agent prompt QA framework ${Date.now()}`,
      description:
        "Create a practical framework for testing support-agent prompts across accuracy, tone, escalation, and schema stability.",
      requirements:
        "Return evaluation categories, pass/fail criteria, regression cases, and a concise release checklist.",
      category: "Prompt Engineering",
      tags: ["Prompt QA", "Support Agents", "Evaluation"],
      budgetUSDC: "2.5",
      license: "CC-BY-4.0",
      requesterAddress: "0x4444444444444444444444444444444444444444",
      agentConsumable: true
    })
  });
  assert(response.status === 201, `expected 201, got ${response.status}`);
  assert(body.request?.id, "missing request id");
  createdRequestId = body.request.id;
});

await test("POST /api/requests/create rejects invalid body", async () => {
  const { response, body } = await request("/api/requests/create", {
    method: "POST",
    body: JSON.stringify({ title: "Bad" })
  });
  assert(response.status === 400, `expected 400, got ${response.status}`);
  assert(typeof body.error === "string", "missing error code");
  assert(hasNoStackTrace(body), "response leaked stack trace");
});

await test("POST /api/requests/[id]/submit accepts valid body", async () => {
  const { response, body } = await request(`/api/requests/${createdRequestId}/submit`, {
    method: "POST",
    body: JSON.stringify({
      providerAddress: "0x5555555555555555555555555555555555555555",
      deliveryText: "QA delivery notes"
    })
  });
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert(body.deliveryHash?.startsWith("0x"), "missing delivery hash");
});

await test("POST /api/requests/[id]/submit rejects invalid body", async () => {
  const { response, body } = await request(`/api/requests/${createdRequestId}/submit`, {
    method: "POST",
    body: JSON.stringify({ providerAddress: "fake", deliveryText: "" })
  });
  assert(response.status === 400, `expected 400, got ${response.status}`);
  assert(typeof body.error === "string", "missing error code");
  assert(hasNoStackTrace(body), "response leaked stack trace");
});

const pages = [
  "/",
  "/marketplace",
  `/marketplace/${validResourceId}`,
  "/publish-resource",
  "/requests",
  "/requests/new",
  "/my-activity",
  "/reputation",
  "/walkthrough",
  "/demo",
  "/agent-api",
  "/tasks/0",
  "/create-task",
  "/explore",
  "/my-tasks"
];

for (const page of pages) {
  await test(`GET ${page} renders`, async () => {
    const { response, body } = await request(page);
    assert(response.status === 200, `expected 200, got ${response.status}`);
    assert(typeof body === "string" && body.includes("<html"), "missing html document");
    assert(hasNoStackTrace(body), "page leaked stack trace");
  });
}

const failed = results.filter((result) => !result.ok);
console.log(`\nQA summary: ${results.length - failed.length}/${results.length} checks passed.`);

if (failed.length > 0) {
  process.exitCode = 1;
}
