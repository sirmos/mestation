const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const net = hre.network.name;
  const pay = JSON.parse(fs.readFileSync(`deployments/${net}.json`, "utf8"));
  const market = JSON.parse(fs.readFileSync(`deployments/${net}-marketV2.json`, "utf8"));

  const abi = [
    "function treasury() view returns (address)",
    "function owner() view returns (address)",
    "function referee() view returns (address)",
    "function feeBps() view returns (uint16)",
  ];

  const targets = [
    ["ElyPay", pay.elyPay],
    ["ElyMarketV2", market.elyMarketV2],
  ];

  for (const [name, address] of targets) {
    const c = await hre.ethers.getContractAt(abi, address);
    console.log(`\n${name} ${address}`);
    for (const fn of ["feeBps", "treasury", "owner", "referee"]) {
      try {
        console.log(`  ${fn}:`, String(await c[fn]()));
      } catch {
        console.log(`  ${fn}: not available`);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});