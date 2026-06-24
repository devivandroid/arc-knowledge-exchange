import { config as loadEnv } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

loadEnv({ path: ".env.local" });
loadEnv();

const privateKey = process.env.PRIVATE_KEY;
const normalizedPrivateKey = normalizePrivateKey(privateKey);

function normalizePrivateKey(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();
  const prefixedValue = trimmedValue.startsWith("0x") ? trimmedValue : `0x${trimmedValue}`;

  return /^0x[0-9a-fA-F]{64}$/.test(prefixedValue) ? prefixedValue : undefined;
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    arcTestnet: {
      url: process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: normalizedPrivateKey ? [normalizedPrivateKey] : []
    }
  }
};

export default config;
