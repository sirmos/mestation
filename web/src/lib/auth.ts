import { meTestnet } from "./chain";

// One place that defines the sign-in message, used by the browser (to create
// it) and the server (to check it). The format follows Sign-In with Ethereum
// (EIP-4361), so wallets can warn if the website does not match.

export const AUTH_STATEMENT =
  "Sign in to MEStation to read and send the messages of your deals. This does not cost gas and does not send any money.";

export const AUTH_LIFETIME_SECONDS = 4 * 3600;

export type AuthMessage = {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
};

export function buildAuthMessage(input: {
  domain: string;
  address: string;
  uri: string;
  nonce: string;
  issuedAt: Date;
  expiresAt: Date;
}): string {
  return [
    `${input.domain} wants you to sign in with your Ethereum account:`,
    input.address,
    "",
    AUTH_STATEMENT,
    "",
    `URI: ${input.uri}`,
    "Version: 1",
    `Chain ID: ${meTestnet.id}`,
    `Nonce: ${input.nonce}`,
    `Issued At: ${input.issuedAt.toISOString()}`,
    `Expiration Time: ${input.expiresAt.toISOString()}`,
  ].join("\n");
}

const PATTERN = new RegExp(
  "^(\\S+) wants you to sign in with your Ethereum account:\\n" +
    "(0x[a-fA-F0-9]{40})\\n\\n" +
    "([^\\n]+)\\n\\n" +
    "URI: ([^\\n]+)\\n" +
    "Version: 1\\n" +
    "Chain ID: (\\d+)\\n" +
    "Nonce: ([a-zA-Z0-9]{8,32})\\n" +
    "Issued At: ([^\\n]+)\\n" +
    "Expiration Time: ([^\\n]+)$"
);

export function parseAuthMessage(message: string): AuthMessage | null {
  const m = PATTERN.exec(message);
  if (!m) return null;
  if (m[3] !== AUTH_STATEMENT) return null;
  return {
    domain: m[1],
    address: m[2],
    statement: m[3],
    uri: m[4],
    chainId: Number(m[5]),
    nonce: m[6],
    issuedAt: m[7],
    expiresAt: m[8],
  };
}

export function randomNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}