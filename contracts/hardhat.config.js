require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const key = process.env.DEPLOYER_PRIVATE_KEY;
const meRpc = process.env.ME_RPC;
const meChainId = process.env.ME_CHAIN_ID;

const networks = {};

// The network only exists once ME_RPC and ME_CHAIN_ID are set, so a missing
// value fails loudly instead of deploying to the wrong chain.
if (meRpc && meChainId) {
  networks.meTestnet = {
    url: meRpc,
    chainId: Number(meChainId),
    accounts: key ? [key] : [],
  };
}

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "paris",
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks,
};