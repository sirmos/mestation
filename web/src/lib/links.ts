import { meTestnet } from "./chain";

export const OFFICIAL_FAUCET = "https://www.mec.me/en-US/faucet";

// Address pages on the ME explorer. Change this if links open "not found",
// or set NEXT_PUBLIC_EXPLORER_ADDRESS_PATH.
const ADDRESS_PATH = process.env.NEXT_PUBLIC_EXPLORER_ADDRESS_PATH || "/address/";

const base = meTestnet.blockExplorers.default.url.replace(/\/$/, "");

// The ME explorer only knows the Cosmos form of a transaction hash, so links
// go through our own /go/tx lookup, which redirects to the right page.
export function explorerTx(hash: string) {
  return `/go/tx/${hash}`;
}

export function explorerAddress(address: string) {
  return `${base}${ADDRESS_PATH}${address}`;
}

export const LINKS = {
  github: "https://github.com/sirmos/mestation",
  // Our own page: shows your ME address and a converter, then links to the faucet.
  faucet: "/get-mec",
  explorer: base,
};