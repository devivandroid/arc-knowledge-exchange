export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? "",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "",
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID ?? "",
  escrowContract: process.env.NEXT_PUBLIC_ESCROW_CONTRACT ?? "",
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL ?? "",
  usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS ?? ""
} as const;
