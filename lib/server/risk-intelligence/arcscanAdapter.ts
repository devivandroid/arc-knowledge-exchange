import { ARC_TESTNET_EXPLORER_URL } from "@/lib/chains/arcTestnet";

type ArcscanAddressResponse = {
  coin_balance?: string;
};

type ArcscanCountersResponse = {
  transactions_count?: string | number;
  token_transfers_count?: string | number;
  gas_usage_count?: string | number;
};

export type ArcscanAddressStats = {
  nativeBalanceUSDC: string;
  transactionsCount: number;
  transfersCount: number;
  gasUsed: string;
};

const arcscanApiBaseUrl =
  process.env.ARCSCAN_API_BASE_URL ||
  `${(process.env.NEXT_PUBLIC_EXPLORER_URL || ARC_TESTNET_EXPLORER_URL).replace(/\/+$/, "")}/api/v2`;

function toNumber(value: string | number | undefined): number {
  if (value === undefined) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNativeUSDC(balance: string | undefined): string {
  if (!balance) return "0.000000";

  const value = BigInt(balance);
  const whole = value / 10n ** 18n;
  const fraction = (value % 10n ** 18n).toString().padStart(18, "0").slice(0, 6);
  return `${whole}.${fraction}`;
}

export async function getArcscanAddressStats(
  wallet: string
): Promise<ArcscanAddressStats | null> {
  const addressUrl = `${arcscanApiBaseUrl}/addresses/${wallet}`;
  const countersUrl = `${addressUrl}/counters`;

  try {
    const [addressResponse, countersResponse] = await Promise.all([
      fetch(addressUrl, { headers: { Accept: "application/json" } }),
      fetch(countersUrl, { headers: { Accept: "application/json" } })
    ]);

    if (!addressResponse.ok || !countersResponse.ok) return null;

    const [address, counters] = (await Promise.all([
      addressResponse.json(),
      countersResponse.json()
    ])) as [ArcscanAddressResponse, ArcscanCountersResponse];

    return {
      nativeBalanceUSDC: formatNativeUSDC(address.coin_balance),
      transactionsCount: toNumber(counters.transactions_count),
      transfersCount: toNumber(counters.token_transfers_count),
      gasUsed: String(counters.gas_usage_count ?? "0")
    };
  } catch {
    return null;
  }
}
