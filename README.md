# MEStation

Pay and get paid safely, with escrow, disputes and reviews tied to real jobs. Built on the Meta Earth Hub testnet.

- **Live demo:** https://mestation.vercel.app
- **Network:** ME Hub testnet (EVM chain ID `400`). Testnet only, no real funds.

## What it is

Freelancers and small businesses working across borders or informally face a trust gap. Clients fear paying for work that never arrives. Workers fear never being paid. Reviews are easy to fake with throwaway accounts, and a good record on one platform cannot be taken to another.

MEStation closes that gap with three pieces:

1. **Payment links.** A person creates a link with an amount and a note, shares it as a URL or QR code, and is paid straight to their wallet. The links never hold funds.
2. **Pay-when-done deals.** A customer hires someone from the directory. The payment waits in a contract until the customer releases it, the review time ends after delivery, or it is refunded. If there is a disagreement, both sides add evidence and a referee decides. If the referee does not answer in time, anyone can split the money in half, so funds never stay stuck.
3. **Reviews tied to finished deals.** Only the customer of a deal that ended in payout or a resolved dispute can review it, and only once. Ratings and comments are stored on the chain and shown on the provider's profile.

## Existing foundation and what is new

This project grew out of an earlier prototype of the same product, built before the hackathon on a different testnet. It is imported into this repository as the commit tagged `baseline-pre-hackathon`. Everything after that tag is new work for this event. See the difference yourself:

```
git log baseline-pre-hackathon..main --oneline
```

| Area | Before the hackathon (baseline) | New in this hackathon |
|---|---|---|
| Contracts | Payment links, escrow with disputes, profiles and handles, 46 tests | Deployed and run on ME Hub testnet; new **ReputationRegistry** contract with 10 tests and a pluggable identity-gate hook |
| Network | Another EVM testnet | ME Hub testnet configuration, env-driven deployment scripts, official HTTPS node with automatic fallback |
| Web app | Pages for links, directory, profiles, deals, dashboard, referee | Review screens, on-chain record with explorer links, ME address converter and faucet helper, redesigned home page and branding |
| Wallet access | Direct RPC calls from the browser | Same-origin HTTPS RPC proxy with a method allow-list, because browsers block the HTTP node from an HTTPS site |
| Sign-in for deal chat | Free-form signed text | Sign-In with Ethereum (EIP-4361) message bound to the site domain, 4-hour lifetime, cleared on disconnect |
| Event index | Indexed two contracts | Also indexes review events; reads the chain in chunks within the ME node's 10,000-block query limit |
| Cleanup | Token and launch features for another ecosystem | Removed; plain-language wallet errors; security updates to Next.js and React |

Contract names keep the `Ely` prefix from the baseline so that history and deployments stay traceable. A fee-discount hook inherited from the baseline remains in the market contract but is switched off (zero address).

## How it uses ME Network

Done today:

- All contracts run on the **ME Hub testnet EVM**. Deployment scripts read the chain ID from the node.
- The app reaches the node through the **official HTTPS endpoint** published by the ME team, with the earlier HTTP node as a fallback.
- A **0x to me1 address converter** (`/get-mec`) lets users claim test MEC from the official faucet, which asks for the Bech32 form.
- Every step of a deal links to the **ME explorer**.

In progress, not built yet:

- **ME ID**: verified badges on profiles and deals, and a verified-only option for reviews.
- **A verified-juror panel** for disputes in place of a single referee.
- **An ME Pass mini-program**, and possibly its own RollApp.

## Contracts on ME Hub testnet

Deployed on 2026-11-27 (UTC) from `0x8906Ea5ed7C01a80CcF3092dC69B81a8B702e13a`. The records are also in `contracts/deployments/`.

| Contract | Address |
|---|---|
| MockUSDC (6-decimal test token, public faucet) | `0x48294347890FBec0E83aF96013C0693Bf061D672` |
| ElyPay (payment links) | `0x40Eb540D95F56FBb03d8d08042fc34A7700f79F1` |
| ElyMarketV2 (profiles, escrow deals, disputes) | `0x9dC04C90e6A3A0b6689B4238d9808311D2215738` |
| ReputationRegistry (reviews) | `0xAdf9FbD78865292DF35970182F62FEe19ee265e5` |

Network details: chain ID `400`, HTTPS RPC `https://beta-hub-8545.explorer-testnet.me`, explorer https://www.explorer-testnet.me/, native token MEC (18 decimals on the EVM side).

The payments use a **test token we deployed ourselves**. It is not Circle's USDC and has no value. For any real use, one setting points the app at a real stablecoin.

## Try it

1. Open https://mestation.vercel.app with MetaMask and press **Connect wallet**, then **Switch to ME Hub**. MetaMask asks once to add the network.
2. Open `/get-mec`. It shows your ME address (me1...) and links to the official faucet. Choose the Hub tab. Claimed MEC arrives within about two hours.
3. Create a profile and a service under **Offer a service**.
4. With a second wallet, open the profile, press **Get 1,000 test USDC**, and hire the service. Approve, then confirm the hire. The money is now held by the contract.
5. As the provider, open the deal from the dashboard and mark it delivered. As the customer, release the payment.
6. The customer sees a **Review** panel. Post a rating. It appears on the provider's profile.
7. Every step is listed under **On-chain record** on the deal page, with explorer links.

## Architecture

```
Browser (wallet)
   |  reads and writes through   /api/rpc  (HTTPS, method allow-list)
   v
Next.js app on Vercel  ------------------------>  ME Hub node (HTTPS, HTTP fallback)
   |                                                    ^
   |  signed sign-in, chat, files                       |  getLogs in chunks
   v                                                    |
Supabase (events, directory, chat, files)  <-- indexer --+
```

- **contracts/**: Solidity 0.8.24, Hardhat, OpenZeppelin. The market contract holds deal funds; the owner can change settings (fee up to 1%, review limits, referee) but cannot move money held in a deal.
- **web/**: Next.js, React, TypeScript, wagmi and viem.
- **Supabase**: an index of chain events for the directory and dashboard, plus private chat messages and evidence files. Data on the chain is the source of truth; the index can be rebuilt.

## Run it yourself

Requirements: Node.js 22 or newer, a wallet, and test MEC for gas.

### Contracts

```
cd contracts
npm install
npx hardhat test
```

To deploy, copy `example.env` to `.env`, set a throwaway `DEPLOYER_PRIVATE_KEY` and fund its address from the faucet, then:

```
npx hardhat run scripts/deploy.js --network meTestnet
npx hardhat run scripts/deployMarketV2.js --network meTestnet
npx hardhat run scripts/deployReputation.js --network meTestnet
```

### Web app

```
cd web
npm install
cp example.env .env.local     (then fill in the values)
npm run dev
```

Create a Supabase project, run `supabase/schema.sql` in its SQL Editor, and put the project URL and keys into `.env.local`. Open `http://localhost:3000`. To fill the directory, open `/api/cron/scan?secret=<CRON_SECRET>` a few times until it reports `"behind":0`.

## Tests

`npx hardhat test` runs 56 tests: payment links and fees, the first market, escrow deals, disputes and referee rules, handles, safety checks (double release, refunds, bad amounts and deadlines, owner-only settings, fee limits), and the reputation registry (one review per finished deal, customer only, rating limits, identity gate, minimum amount).

## Security and privacy

- **Not audited.** The contracts have automated tests but no independent audit. Use test funds only.
- **Non-custodial.** Payment links never hold funds. Deals hold funds in the contract under fixed rules.
- **Sign-in for chat** is a free message that moves no money. It names the website, expires after 4 hours, and is kept only in the browser tab.
- **The RPC proxy** only forwards a fixed list of read methods and transaction broadcasting, and limits request size.
- **Public by design:** profile fields (name, city, headline, bio, contact), handles, deals, payments and reviews are on the blockchain and cannot be deleted.
- **Chat and files are private from other users but not end-to-end encrypted.** They are stored in Supabase, so the operator of the project can read them.

## Roadmap

ME ID verified badges and verified-only reviews, a verified-juror panel for disputes, an ME Pass mini-program, an independent audit before any real money, and swapping the test token for a real stablecoin.

## Repository layout

```
contracts/    Solidity contracts, tests, deployment scripts and records
web/          Next.js app, API routes and the event indexer
supabase/     Database schema
```