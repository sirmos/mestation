// Forwards allow-listed JSON-RPC calls to the ME Hub node, so browsers and
// wallets can use an HTTPS address even though the node speaks plain HTTP.
export const dynamic = "force-dynamic";

const UPSTREAM = process.env.ME_RPC_UPSTREAM || "http://118.175.0.249:8545";

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

  try {
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: text,
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return Response.json(rpcError(null, "ME node unreachable"), { status: 502 });
  }
}