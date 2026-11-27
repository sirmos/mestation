import { defineChain } from "viem";

// Fill in these values from the ME developer docs or the ME developer community.
// ME_CHAIN_ID is the EVM (EIP-155) chain ID, not the Cosmos chain name.
const ME_CHAIN_ID = 0;
const ME_RPC_URL = "REPLACE_WITH_ME_EVM_RPC_URL";
const ME_EXPLORER_URL = "REPLACE_WITH_ME_EXPLORER_URL";

export const meTestnet = defineChain({
  id: ME_CHAIN_ID,
  name: "ME Testnet",
  // Confirm the symbol and decimals with ME (18 is typical on EVM chains).
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