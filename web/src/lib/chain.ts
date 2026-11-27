import { defineChain } from "viem";

// ME Hub testnet. The EVM RPC below is the default documented by the ME JS SDK.
// It is plain HTTP. See the note in the project README about HTTPS hosting.
// Override any value in web/.env.local.
const ME_CHAIN_ID = Number(process.env.NEXT_PUBLIC_ME_CHAIN_ID || 400);
const ME_RPC_URL =
  process.env.NEXT_PUBLIC_ME_RPC_URL || "http://118.175.0.249:8545";
const ME_EXPLORER_URL =
  process.env.NEXT_PUBLIC_ME_EXPLORER_URL || "https://www.explorer-testnet.me";

export const meTestnet = defineChain({
  id: ME_CHAIN_ID,
  name: "ME Hub Testnet",
  nativeCurrency: { name: "MEC", symbol: "MEC", decimals: 18 },
  rpcUrls: {
    default: { http: [ME_RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "ME Explorer",
      url: ME_EXPLORER_URL,
    },
  },
  testnet: true,
});