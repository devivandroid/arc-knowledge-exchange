import { NextResponse } from "next/server";
import {
  ARC_TESTNET_CHAIN_ID,
  ARC_TESTNET_CHAIN_ID_HEX,
  ARC_TESTNET_RPC_URL,
  ARC_TESTNET_WS_URL
} from "@/lib/chains/arcTestnet";
import { usdcAddress } from "@/lib/contracts/microWorkEscrow";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    name: "Arc Knowledge Exchange Agent API",
    network: {
      name: "Arc Testnet",
      chainId: ARC_TESTNET_CHAIN_ID,
      chainIdHex: ARC_TESTNET_CHAIN_ID_HEX,
      rpcUrl: ARC_TESTNET_RPC_URL,
      wsUrl: ARC_TESTNET_WS_URL,
      nativeGasToken: "USDC",
      usdcAddress,
      usdcDecimals: 6
    },
    payment: {
      standard: "HTTP_402_USDC_TRANSFER",
      token: "USDC",
      tokenType: "ERC-20",
      settlement: "direct_transfer_to_seller",
      amountDecimals: 6,
      proof: {
        type: "Arc Testnet transaction hash",
        verification: "stateless_tx_receipt_check"
      }
    },
    capabilities: [
      {
        id: "search_resources",
        method: "GET",
        endpoint: "/api/resources/search",
        query: ["q", "resourceType", "category", "license", "agentConsumable"]
      },
      {
        id: "publish_resource",
        method: "POST",
        endpoint: "/api/resources/publish",
        requiredFields: [
          "title",
          "description",
          "resourceType",
          "priceUSDC",
          "license",
          "sellerAddress"
        ]
      },
      {
        id: "buy_resource_via_402",
        method: "GET",
        endpoint: "/api/resources/{id}",
        note: "Returns 402 Payment Required until a valid Arc Testnet USDC transfer proof is provided.",
        responseCodes: [200, 402, 404, 502]
      },
      {
        id: "downloadable_assets",
        method: "GET",
        endpoint: "/api/download/{resourceId}/{filename}",
        note: "Streams private resource files after txHash and buyerAddress pass payment verification.",
        features: ["authenticated_downloads", "file_metadata", "content_disposition_attachment"],
        responseCodes: [200, 402, 403, 404, 502]
      },
      {
        id: "query_wallet_risk",
        method: "GET",
        endpoint: "/api/reputation/{wallet}",
        note: "Returns a preview wallet risk profile and reputation signals based only on Knowledge Exchange activity.",
        responseCodes: [200, 400]
      },
      {
        id: "search_requests",
        method: "GET",
        endpoint: "/api/requests/search",
        query: ["q", "category", "license", "status", "agentConsumable"]
      },
      {
        id: "create_request_draft",
        method: "POST",
        endpoint: "/api/requests/create",
        requiredFields: [
          "title",
          "description",
          "requirements",
          "budgetUSDC",
          "license",
          "requesterAddress"
        ]
      },
      {
        id: "submit_request_delivery",
        method: "POST",
        endpoint: "/api/requests/{id}/submit",
        requiredFields: ["providerAddress", "deliveryText"]
      }
    ],
    limitations: [
      "No database yet.",
      "Server-side ephemeral storage may reset on restart.",
      "No authentication or API keys yet.",
      "No replay protection yet.",
      "Access proofs are unsigned preview tokens, not production authorization tokens.",
      "Escrow funding still requires wallet interaction.",
      "Arc Testnet only."
    ]
  });
}
