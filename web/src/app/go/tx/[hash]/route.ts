import { cosmosHashFor } from "@/lib/cosmosHash";

export const dynamic = "force-dynamic";

const EXPLORER = (
  process.env.NEXT_PUBLIC_ME_EXPLORER_URL || "https://www.explorer-testnet.me"
).replace(/\/$/, "");

// Set EXPLORER_TX_PATH if the explorer uses another page for transactions.
const TX_PATH = process.env.EXPLORER_TX_PATH || "/tx/";

type Ctx = { params: Promise<{ hash: string }> };

// /go/tx/<ethereum hash> sends the visitor to that transaction on the ME
// explorer, which only knows the Cosmos form of the hash.
export async function GET(_req: Request, ctx: Ctx) {
  const { hash } = await ctx.params;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) {
    return new Response("Bad transaction hash", { status: 400 });
  }

  const cosmos = await cosmosHashFor(hash);
  const target = cosmos ? `${EXPLORER}${TX_PATH}${cosmos}` : `${EXPLORER}/`;
  return Response.redirect(target, 302);
}