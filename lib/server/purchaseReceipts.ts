import { isPostgresEnabled, pgQuery } from "@/lib/server/postgres";
import type { InstantPurchaseReceipt } from "@/lib/server/verifyInstantPurchase";

export async function savePurchaseReceipt(receipt: InstantPurchaseReceipt): Promise<void> {
  if (!isPostgresEnabled()) return;

  await pgQuery(
    `
      INSERT INTO purchase_receipts (
        tx_hash,
        resource_id,
        buyer_address,
        seller_address,
        amount_usdc,
        data,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
      ON CONFLICT (tx_hash) DO UPDATE SET
        resource_id = EXCLUDED.resource_id,
        buyer_address = EXCLUDED.buyer_address,
        seller_address = EXCLUDED.seller_address,
        amount_usdc = EXCLUDED.amount_usdc,
        data = EXCLUDED.data
    `,
    [
      receipt.txHash,
      receipt.resourceId,
      receipt.buyerAddress,
      receipt.sellerAddress,
      receipt.amountUSDC,
      JSON.stringify(receipt)
    ]
  );
}
