// Forwards allow-listed JSON-RPC calls to the ME Hub node, so browsers and
// wallets can use an HTTPS address of our own.
export const dynamic = "force-dynamic";

// Tried in order. The official HTTPS node comes first, the old HTTP node is
// the fallback. Set ME_RPC_UPSTREAM to put another node at the front.
const UPSTREAMS = [
  process.env.ME_RPC_UPSTREAM,
  "https://beta-hub-8545.explorer-testnet.me",
  "http://118.175.0.249:8545",
]
  .filter((url): url is string => Boolean(url))
  .filter((url, i, all) => all.indexOf(url) === i)
  .map((url) => ({ url, name: url.startsWith("https") ? "https" : "http-fallback" }));

const ALLOWED = new Set([
  "web3_clientVersion",
  "net_version",
  "eth_chainId",
  "eth_blockNumber",
  "eth_gasPrice",
  "eth_maxPriorityFeePerGas",
  "eth_feeHistory",
  "eth_getBalance",
  "eth_getCode",
  "eth_getStorageAt",
  "eth_getTransactionCount",
  "eth_getTransactionByHash",
  "eth_getTransactionReceipt",
  "eth_getBlockByNumber",
  "eth_getBlockByHash",
  "eth_call",
  "eth_estimateGas",
  "eth_getLogs",
  "eth_sendRawTransaction",
]);

type RpcCall = { id?: unknown; method?: unknown };

function rpcError(id: unknown, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code: -32601, message } };
}

export async function POST(request: Request) {
  const text = await request.text();
  if (text.length > 100_000) {
    return Response.json(rpcError(null, "Request too large"), { status: 413 });
  }

  let body: RpcCall | RpcCall[];
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json(rpcError(null, "Invalid JSON"), { status: 400 });
  }

  const calls = Array.isArray(body) ? body : [body];
  if (calls.length === 0 || calls.length > 50) {
    return Response.json(rpcError(null, "Bad batch size"), { status: 400 });
  }
  for (const call of calls) {
    if (!call || typeof call.method !== "string" || !ALLOWED.has(call.method)) {
      return Response.json(rpcError(call?.id, "Method not allowed"), { status: 403 });
    }
  }

  const isSend = calls.some((c) => c.method === "eth_sendRawTransaction");
  let lastError = "ME node unreachable";

  for (const upstream of UPSTREAMS) {
    try {
      const res = await fetch(upstream.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: text,
        signal: AbortSignal.timeout(isSend ? 20_000 : 12_000),
        cache: "no-store",
      });

      // A server error on a read: try the next node. Never re-send a transaction.
      if (res.status >= 500 && !isSend) {
        lastError = `The ${upstream.name} node answered ${res.status}`;
        continue;
      }

      return new Response(await res.text(), {
        status: res.status,
        headers: {
          "content-type": "application/json",
          "x-upstream": upstream.name,
        },
      });
    } catch (e) {
      lastError = `The ${upstream.name} node did not answer`;
      // A timeout on a broadcast may mean the node accepted it. Do not send it twice.
      if (isSend && (e as { name?: string })?.name === "TimeoutError") break;
    }
  }

  return Response.json(rpcError(null, lastError), { status: 502 });
}