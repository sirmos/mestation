const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const provider = hre.ethers.provider;
  const base = JSON.parse(fs.readFileSync(`deployments/${hre.network.name}.json`, "utf8"));
  const market = JSON.parse(
    fs.readFileSync(`deployments/${hre.network.name}-marketV2.json`, "utf8")
  );
  const latest = await provider.getBlockNumber();
  console.log("Latest block:", latest);

  // The exact span the web app scans (DEPLOY_BLOCK to latest).
  let appStart = null;
  try {
    const env = fs.readFileSync("../web/.env.local", "utf8");
    const m = env.match(/NEXT_PUBLIC_DEPLOY_BLOCK=(\d+)/);
    if (m) appStart = Number(m[1]);
  } catch {
    // no env file found, skip this test
  }

  const targets = [
    ["ElyPay", base.elyPay],
    ["ElyMarketV2", market.elyMarketV2],
  ];

  for (const [name, address] of targets) {
    const tests = [
      ["last 1000 blocks", Math.max(0, latest - 1000)],
      ["last 5000 blocks", Math.max(0, latest - 5000)],
      ["last 20000 blocks", Math.max(0, latest - 20000)],
    ];
    if (appStart !== null) tests.push([`app range (${latest - appStart} blocks)`, appStart]);

    for (const [label, from] of tests) {
      try {
        const logs = await provider.getLogs({ address, fromBlock: from, toBlock: "latest" });
        console.log(`${name}: ${logs.length} logs, ${label}`);
      } catch (e) {
        console.log(`${name}: getLogs FAILED for ${label}:`, e.shortMessage || e.message);
      }
    }
  }

  const pay = await hre.ethers.getContractAt(
    [
      "function links(uint256) view returns (address owner, uint256 amount, bool active, uint32 payments, uint256 totalReceived, string memo)",
    ],
    base.elyPay
  );
  for (const id of [0, 1, 2]) {
    try {
      const l = await pay.links(id);
      console.log("link", id, "owner:", l.owner, "amount:", l.amount.toString(), "memo:", l.memo);
    } catch (e) {
      console.log("link", id, "read failed:", e.shortMessage || e.message);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});