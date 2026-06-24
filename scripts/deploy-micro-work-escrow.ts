import hre from "hardhat";

const { ethers, network } = hre;

const ARC_TESTNET_USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const ARC_TESTNET_EXPLORER_URL = "https://testnet.arcscan.app";

async function main() {
  const privateKey = process.env.PRIVATE_KEY?.trim();
  const normalizedPrivateKey = privateKey?.startsWith("0x") ? privateKey : `0x${privateKey ?? ""}`;

  if (!/^0x[0-9a-fA-F]{64}$/.test(normalizedPrivateKey)) {
    throw new Error(
      "PRIVATE_KEY in .env.local is missing or invalid. Use the testnet wallet private key, 64 hex characters, with or without 0x. Do not use the public wallet address."
    );
  }

  const [deployer] = await ethers.getSigners();

  if (!deployer) {
    throw new Error(
      "No deployer account found. Set PRIVATE_KEY in .env.local before deploying. Never commit or share it."
    );
  }

  const escrow = await ethers.deployContract("WorkEscrow", [
    ARC_TESTNET_USDC_ADDRESS,
    deployer.address
  ]);

  await escrow.waitForDeployment();

  const contractAddress = await escrow.getAddress();
  const providerNetwork = await ethers.provider.getNetwork();

  console.log("WorkEscrow deployed");
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Network: ${network.name}`);
  console.log(`Chain ID: ${providerNetwork.chainId.toString()}`);
  console.log(`USDC address: ${ARC_TESTNET_USDC_ADDRESS}`);
  console.log(`Explorer link: ${ARC_TESTNET_EXPLORER_URL}/address/${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
