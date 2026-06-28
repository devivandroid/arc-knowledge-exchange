import { Interface, JsonRpcProvider, formatUnits, isAddress, parseUnits } from "ethers";
import { ARC_TESTNET_CHAIN_ID, ARC_TESTNET_RPC_URL } from "@/lib/chains/arcTestnet";
import { usdcAddress, usdcDecimals } from "@/lib/contracts/microWorkEscrow";
import { getServerResourceByIdAsync } from "@/lib/server/agentMockStore";
import type { InstantResource } from "@/types/resource";

const erc20Interface = new Interface([
  "function transfer(address to, uint256 amount) returns (bool)"
]);

export type InstantPurchaseReceipt = {
  txHash: string;
  buyerAddress: string;
  sellerAddress: string;
  amountUSDC: string;
  resourceId: string;
  license: string;
  resourceType: string;
  blockNumber: number;
};

export type VerifyInstantPurchaseResult =
  | {
      ok: true;
      resource: InstantResource;
      receipt: InstantPurchaseReceipt;
      accessToken: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
      message: string;
      resource?: InstantResource;
    };

function getProvider() {
  return new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || ARC_TESTNET_RPC_URL);
}

function createAccessToken(resourceId: string, txHash: string, buyerAddress: string): string {
  return Buffer.from(
    JSON.stringify({
      typ: "kx-platform-access-proof",
      resourceId,
      txHash,
      buyerAddress,
      issuedAt: new Date().toISOString()
    })
  ).toString("base64url");
}

export async function verifyInstantPurchase({
  resourceId,
  txHash,
  buyerAddress
}: {
  resourceId: string;
  txHash: string;
  buyerAddress: string;
}): Promise<VerifyInstantPurchaseResult> {
  const resource = await getServerResourceByIdAsync(resourceId);

  if (!resource) {
    return {
      ok: false,
      status: 404,
      error: "RESOURCE_NOT_FOUND",
      message: "Resource not found."
    };
  }

  if (!txHash || !/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
    return {
      ok: false,
      status: 400,
      error: "INVALID_TX_HASH",
      message: "Provide a valid transaction hash.",
      resource
    };
  }

  if (!isAddress(buyerAddress)) {
    return {
      ok: false,
      status: 400,
      error: "INVALID_BUYER_ADDRESS",
      message: "Provide a valid buyer address.",
      resource
    };
  }

  if (!isAddress(resource.sellerAddress)) {
    return {
      ok: false,
      status: 500,
      error: "INVALID_SELLER_ADDRESS",
      message: "Resource seller address is not valid.",
      resource
    };
  }

  const provider = getProvider();
  const [transaction, receipt, network] = await Promise.all([
    provider.getTransaction(txHash),
    provider.getTransactionReceipt(txHash),
    provider.getNetwork()
  ]);

  if (Number(network.chainId) !== ARC_TESTNET_CHAIN_ID) {
    return {
      ok: false,
      status: 502,
      error: "WRONG_RPC_NETWORK",
      message: "Configured RPC is not connected to Arc Testnet.",
      resource
    };
  }

  if (!transaction || !receipt) {
    return {
      ok: false,
      status: 402,
      error: "PAYMENT_NOT_FOUND",
      message: "Payment transaction was not found on Arc Testnet.",
      resource
    };
  }

  if (receipt.status !== 1) {
    return {
      ok: false,
      status: 402,
      error: "PAYMENT_FAILED",
      message: "Payment transaction did not succeed.",
      resource
    };
  }

  if (transaction.from.toLowerCase() !== buyerAddress.toLowerCase()) {
    return {
      ok: false,
      status: 402,
      error: "BUYER_MISMATCH",
      message: "buyerAddress does not match the transaction sender.",
      resource
    };
  }

  if (!transaction.to || transaction.to.toLowerCase() !== usdcAddress.toLowerCase()) {
    return {
      ok: false,
      status: 402,
      error: "NOT_USDC_TRANSFER",
      message: "Transaction was not sent to the Arc Testnet ERC-20 USDC contract.",
      resource
    };
  }

  if (transaction.value !== 0n) {
    return {
      ok: false,
      status: 402,
      error: "UNEXPECTED_NATIVE_VALUE",
      message: "ERC-20 USDC transfer transactions must not include native value.",
      resource
    };
  }

  let parsed: ReturnType<typeof erc20Interface.parseTransaction> | null = null;

  try {
    parsed = erc20Interface.parseTransaction({ data: transaction.data, value: transaction.value });
  } catch {
    return {
      ok: false,
      status: 402,
      error: "INVALID_TRANSFER_CALL",
      message: "Transaction calldata is not an ERC-20 transfer call.",
      resource
    };
  }

  if (!parsed || parsed.name !== "transfer") {
    return {
      ok: false,
      status: 402,
      error: "INVALID_TRANSFER_CALL",
      message: "Transaction did not call ERC-20 transfer.",
      resource
    };
  }

  const [recipient, amount] = parsed.args as unknown as [string, bigint];
  const requiredAmount = parseUnits(resource.priceUSDC, usdcDecimals);

  if (recipient.toLowerCase() !== resource.sellerAddress.toLowerCase()) {
    return {
      ok: false,
      status: 402,
      error: "SELLER_MISMATCH",
      message: "USDC transfer recipient does not match the resource seller.",
      resource
    };
  }

  if (amount < requiredAmount) {
    return {
      ok: false,
      status: 402,
      error: "INSUFFICIENT_PAYMENT",
      message: "USDC transfer amount is lower than the resource price.",
      resource
    };
  }

  const normalizedBuyer = buyerAddress.toLowerCase();
  const receiptPayload: InstantPurchaseReceipt = {
    txHash,
    buyerAddress,
    sellerAddress: resource.sellerAddress,
    amountUSDC: formatUnits(amount, usdcDecimals),
    resourceId,
    license: resource.license,
    resourceType: resource.resourceType,
    blockNumber: receipt.blockNumber
  };

  return {
    ok: true,
    resource,
    receipt: receiptPayload,
    accessToken: createAccessToken(resourceId, txHash, normalizedBuyer)
  };
}
