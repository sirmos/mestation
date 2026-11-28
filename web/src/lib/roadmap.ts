// The roadmap on the home page. Edit this file to change it.
// Only put something under "Live" after you have tested it on ME Hub testnet.

export const roadmap = [
  {
    key: "live",
    phase: "Live on ME Hub testnet",
    status: "Done",
    items: [
      "Payment link contract",
      "Pay-when-done escrow with disputes and a referee",
      "Reputation contract: one review per finished deal",
      "ME address converter for the test faucet",
      "HTTPS proxy so browsers and wallets can reach the ME node",
    ],
  },
  {
    key: "dev",
    phase: "In development",
    status: "Building now",
    items: [
      "Payment links, services and deals end to end on ME",
      "Reviews and ratings in the app",
      "ME ID verified profiles and verified-only reviews",
      "A verified-juror panel instead of one referee",
    ],
  },
  {
    key: "plan",
    phase: "Planned",
    status: "After the build",
    items: [
      "ME Pass mini-program for links and orders",
      "Its own RollApp registered on the ME Hub",
      "Telegram and Discord alerts for deals",
      "Independent security audit before any real money",
    ],
  },
  {
    key: "later",
    phase: "Later",
    status: "Exploring",
    items: [
      "Local currency to USDC through a licensed partner",
      "Sign in with email",
      "Mobile app",
    ],
  },
];