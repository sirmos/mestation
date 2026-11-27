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

  const usdc = await hre.ethers.deployContract("MockUSDC");
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();

  // Fee is 50 bps (0.5%). Treasury is the deployer for now.
  const pay = await hre.ethers.deployContract("ElyPay", [
    usdcAddress,
    deployer.address,
    50,
  ]);
  await pay.waitForDeployment();
  const payAddress = await pay.getAddress();

  const out = {
    network: hre.network.name,
    chainId,
    usdc: usdcAddress,
    elyPay: payAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.mkdirSync("deployments", { recursive: true });
  fs.writeFileSync(`deployments/${hre.network.name}.json`, JSON.stringify(out, null, 2));
  console.log(out);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});