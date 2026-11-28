import { parseAbi } from "viem";
import type { Address } from "viem";

// The ReputationRegistry deployed on ME Hub testnet.
// See contracts/deployments/meTestnet-reputation.json.
export const REPUTATION_ADDRESS = (process.env.NEXT_PUBLIC_REPUTATION ||
  "0xAdf9FbD78865292DF35970182F62FEe19ee265e5") as Address;

export const reputationAbi = parseAbi([
  "function postReview(uint256 dealId, uint8 rating, string comment)",
  "function reviewed(uint256) view returns (bool)",
  "function getReview(uint256 dealId) view returns ((uint8 rating, uint64 postedAt, string comment))",
  "function reviewCount(address) view returns (uint32)",
  "function ratingSum(address) view returns (uint64)",
  "function averageRatingX100(address provider) view returns (uint256)",
  "event ReviewPosted(uint256 indexed dealId, address indexed provider, address indexed customer, uint8 rating, string comment)",
]);