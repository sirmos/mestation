import { defineChain } from "viem";

const ME_CHAIN_ID = Number(process.env.NEXT_PUBLIC_ME_CHAIN_ID || 400);
const ME_EXPLORER_URL =
  process.env.NEXT_PUBLIC_ME_EXPLORER_URL || "https://www.explorer-testnet.me";

// The ME node speaks plain HTTP. Browsers on an HTTPS site cannot call it, and
// wallets will not add it. So in the browser we call our own /api/rpc route
// (HTTPS on the live site, localhost in development), which forwards to the
// node. On the server we call the node directly.
const NODE_RPC = process.env.ME_RPC_UPSTREAM || "http://118.175.0.249:8545";
const RPC_URL =
  typeof window === "undefined" ? NODE_RPC : `${window.location.origin}/api/rpc`;

export const meTestnet = defineChain({
  id: ME_CHAIN_ID,
  name: "ME Hub Testnet",
  nativeCurrency: { name: "MEC", symbol: "MEC", decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "ME Explorer",
      url: ME_EXPLORER_URL,
    },
  },
  testnet: true,
});