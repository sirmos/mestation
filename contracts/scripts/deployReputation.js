const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const net = await hre.ethers.provider.getNetwork();
  const chainId = Number(net.chainId);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Network:", hre.network.name, "chainId:", chainId);
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance));
  if (balance === 0n) {
    throw new Error("Deployer has no balance. Fund it from the faucet first.");
  }

  const market = JSON.parse(
    fs.readFileSync(`deployments/${hre.network.name}-marketV2.json`, "utf8")
  );
  console.log("Using market at:", market.elyMarketV2);

  const registry = await hre.ethers.deployContract("ReputationRegistry", [
    market.elyMarketV2,
  ]);
  await registry.waitForDeployment();
  const address = await registry.getAddress();

  const out = {
    network: hre.network.name,
    chainId,
    market: market.elyMarketV2,
    reputationRegistry: address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    `deployments/${hre.network.name}-reputation.json`,
    JSON.stringify(out, null, 2)
  );
  console.log(out);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});