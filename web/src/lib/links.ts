import { meTestnet } from "./chain";

export const OFFICIAL_FAUCET = "https://www.mec.me/en-US/faucet";

// How the ME explorer builds its links. MetaMask uses /tx/ and /address/ by
// default. If links open a "not found" page, change these two values (or set
// NEXT_PUBLIC_EXPLORER_TX_PATH and NEXT_PUBLIC_EXPLORER_ADDRESS_PATH).
const TX_PATH = process.env.NEXT_PUBLIC_EXPLORER_TX_PATH || "/tx/";
const ADDRESS_PATH = process.env.NEXT_PUBLIC_EXPLORER_ADDRESS_PATH || "/address/";

const base = meTestnet.blockExplorers.default.url.replace(/\/$/, "");

export function explorerTx(hash: string) {
  return `${base}${TX_PATH}${hash}`;
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