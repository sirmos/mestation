import { meTestnet } from "./chain";

export const OFFICIAL_FAUCET = "https://www.mec.me/en-US/faucet";

export const LINKS = {
  github: "https://github.com/sirmos/mestation",
  // Our own page: shows your ME address and a converter, then links to the faucet.
  faucet: "/get-mec",
  explorer: meTestnet.blockExplorers.default.url,

  // Legacy entries. These go away when the old Ascend and token pages are removed.
  discord: "https://discord.gg/ZTQUJGCa4y",
  telegramBot: "https://t.me/elystation_bot",
  ascend: "https://ascendlaunch.xyz",
  ascendDocs: "https://ascendlaunch.gitbook.io/docs",
};

// Legacy draft token details. Removed with the token page.
export const TOKEN = {
  name: "MEStation",
  ticker: "ELYST",
};