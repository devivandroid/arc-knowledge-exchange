export const ARC_TESTNET_RPC_URL = "https://rpc.testnet.arc.network";
export const ARC_TESTNET_WS_URL = "wss://rpc.testnet.arc.network";
export const ARC_TESTNET_CHAIN_ID = 5042002;
export const ARC_TESTNET_CHAIN_ID_HEX = "0x4CF4B2";
export const ARC_TESTNET_EXPLORER_URL = "https://testnet.arcscan.app";

export const ARC_TESTNET_USDC = {
  address: process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x3600000000000000000000000000000000000000",
  symbol: "USDC",
  decimals: 6
} as const;

export const ARC_TESTNET_NATIVE_CURRENCY = {
  name: "USDC",
  symbol: "USDC",
  decimals: 6
} as const;

export const arcTestnet = {
  id: ARC_TESTNET_CHAIN_ID,
  chainIdHex: ARC_TESTNET_CHAIN_ID_HEX,
  name: "Arc Testnet",
  rpcUrl: ARC_TESTNET_RPC_URL,
  wsUrl: ARC_TESTNET_WS_URL,
  explorerUrl: ARC_TESTNET_EXPLORER_URL,
  nativeCurrency: ARC_TESTNET_NATIVE_CURRENCY,
  usdc: ARC_TESTNET_USDC
} as const;

export const arcTestnetWalletParams = {
  chainId: arcTestnet.chainIdHex,
  chainName: arcTestnet.name,
  nativeCurrency: arcTestnet.nativeCurrency,
  rpcUrls: [arcTestnet.rpcUrl],
  blockExplorerUrls: [arcTestnet.explorerUrl]
} as const;

export function isArcTestnetChainId(chainId: bigint | number | string | null): boolean {
  if (chainId === null) {
    return false;
  }

  return Number(chainId) === ARC_TESTNET_CHAIN_ID;
}
