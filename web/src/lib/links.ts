import { meTestnet } from "./chain";

export const LINKS = {
  github: "https://github.com/sirmos/mestation",
  faucet: "https://www.mec.me/en-US/faucet",
  explorer: meTestnet.blockExplorers.default.url,

  // Legacy links from the earlier version. These are removed when the home
  // page, token page and bots are rewritten for MEStation.
  discord: "https://discord.gg/ZTQUJGCa4y",
  telegramBot: "https://t.me/elystation_bot",
  ascend: "https://ascendlaunch.xyz",
  ascendDocs: "https://ascendlaunch.gitbook.io/docs",
};

// Legacy draft token details. Removed with the token page.
export const TOKEN = {
  name: "Elystation",
  ticker: "ELYST",
};