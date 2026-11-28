const TENDERMINT_RPC =
  process.env.ME_TENDERMINT_RPC || "https://beta-hub-26657.explorer-testnet.me";

const known = new Map<string, string>();

// ME's explorer indexes Cosmos transaction hashes, while wallets show the
// Ethereum-style hash. The node can translate one into the other.
export async function cosmosHashFor(ethHash: string): Promise<string | null> {
  const key = ethHash.toLowerCase();
  const cached = known.get(key);
  if (cached) return cached;

  try {
    const query = `"ethereum_tx.ethereumTxHash='${key}'"`;
    const res = await fetch(
      `${TENDERMINT_RPC}/tx_search?query=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(10_000), cache: "no-store" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const found = json?.result?.txs?.[0]?.hash;
    if (typeof found !== "string" || !/^[0-9a-fA-F]{64}$/.test(found)) return null;
    const hash = found.toUpperCase();
    known.set(key, hash);
    return hash;
  } catch {
    return null;
  }
}