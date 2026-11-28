import { parseAbi } from "viem";
import type { Address } from "viem";

const ZERO = "0x0000000000000000000000000000000000000000" as Address;

function addr(value: string | undefined): Address {
  return value && /^0x[0-9a-fA-F]{40}$/.test(value) ? (value as Address) : ZERO;
}

// Set these in web/.env.local after deploying (see contracts/deployments/).
export const ADDRESSES = {
  usdc: addr(process.env.NEXT_PUBLIC_USDC),
  elyPay: addr(process.env.NEXT_PUBLIC_PAY),
  elyMarket: addr(process.env.NEXT_PUBLIC_MARKET),
  // Legacy token field. Removed together with the token page.
  elyst: addr(process.env.NEXT_PUBLIC_ELYST),
};

export const USDC_DECIMALS = 6;
export const ELYST_DECIMALS = 18;

// Block where the contracts were created. Set NEXT_PUBLIC_DEPLOY_BLOCK after
// deploying so log scans do not start from block zero.
export const DEPLOY_BLOCK = BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK || "0");

export const elyPayAbi = parseAbi([
  "function createLink(uint256 amount, string memo) returns (uint256 id)",
  "function pay(uint256 id, uint256 amount)",
  "function setActive(uint256 id, bool active)",
  "function feeBps() view returns (uint16)",
  "function links(uint256) view returns (address owner, uint256 amount, bool active, uint32 payments, uint256 totalReceived, string memo)",
  "event LinkCreated(uint256 indexed id, address indexed owner, uint256 amount, string memo)",
  "event Paid(uint256 indexed id, address indexed payer, address indexed receiver, uint256 amount, uint256 fee)",
]);

export const elyMarketAbi = parseAbi([
  "function setProfile((string name, string headline, string category, string city, string bio, string contact) p)",
  "function claimHandle(string handle)",
  "function handleOf(address) view returns (string)",
  "function handleOwner(bytes32) view returns (address)",
  "function addService(string title, uint256 price)",
  "function setServiceActive(uint256 index, bool active)",
  "function getServices(address provider) view returns ((string title, uint256 price, bool active)[])",
  "function profiles(address) view returns (string name, string headline, string category, string city, string bio, string contact, uint64 updatedAt)",
  "function jobsCompleted(address) view returns (uint32)",
  "function totalEarned(address) view returns (uint256)",
  "function disputesOpened(address) view returns (uint32)",
  "function disputesLost(address) view returns (uint32)",
  "function createDeal(address provider, uint256 amount, string title, uint64 deadline, uint64 reviewSeconds) returns (uint256 id)",
  "function markDelivered(uint256 id)",
  "function release(uint256 id)",
  "function claimAfterReview(uint256 id)",
  "function refund(uint256 id)",
  "function openDispute(uint256 id, string reason)",
  "function addEvidence(uint256 id, string note)",
  "function resolve(uint256 id, uint16 providerShareBps, string ruling)",
  "function resolveAfterTimeout(uint256 id)",
  "function deals(uint256) view returns (address customer, address provider, uint256 amount, uint64 deadline, uint64 reviewSeconds, uint64 reviewEnds, uint64 resolveBy, uint8 status, string title)",
  "function feeBps() view returns (uint16)",
  "function referee() view returns (address)",
  "function minReview() view returns (uint64)",
  "function maxReview() view returns (uint64)",
  "function resolveWindow() view returns (uint64)",
  "function discountToken() view returns (address)",
  "function discountMinBalance() view returns (uint256)",
  "function discountFeeBps() view returns (uint16)",
  "event ProfileSet(address indexed provider, string name, string headline, string category, string city)",
  "event DealCreated(uint256 indexed id, address indexed customer, address indexed provider, uint256 amount, uint64 deadline, string title)",
  "event DisputeOpened(uint256 indexed id, address indexed customer, string reason)",
  "event EvidenceAdded(uint256 indexed id, address indexed by, string note)",
  "event DisputeResolved(uint256 indexed id, uint16 providerShareBps, uint256 providerNet, uint256 customerAmount, string ruling)",
]);

export const usdcAbi = parseAbi([
  "function faucet()",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
]);

export const elystAbi = parseAbi([
  "function faucet()",
  "function balanceOf(address account) view returns (uint256)",
]);