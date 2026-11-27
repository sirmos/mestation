"use client";

import { useReadContract } from "wagmi";
import type { Address } from "viem";
import { meTestnet } from "./chain";
import { ADDRESSES, elyMarketAbi, elystAbi } from "./contracts";

const ZERO = "0x0000000000000000000000000000000000000000" as const;

// The fee a provider pays on services, with the ELYST discount if it applies.
// The deal page shows the standard fee. Holders pay this lower fee when paid out.
export function useFeeFor(provider?: Address) {
  const base = useReadContract({
    address: ADDRESSES.elyMarket,
    abi: elyMarketAbi,
    functionName: "feeBps",
    chainId: meTestnet.id,
  });
  const token = useReadContract({
    address: ADDRESSES.elyMarket,
    abi: elyMarketAbi,
    functionName: "discountToken",
    chainId: meTestnet.id,
  });
  const min = useReadContract({
    address: ADDRESSES.elyMarket,
    abi: elyMarketAbi,
    functionName: "discountMinBalance",
    chainId: meTestnet.id,
  });
  const bps = useReadContract({
    address: ADDRESSES.elyMarket,
    abi: elyMarketAbi,
    functionName: "discountFeeBps",
    chainId: meTestnet.id,
  });

  const tokenAddress = token.data;
  const active = !!tokenAddress && tokenAddress !== ZERO;

  const balance = useReadContract({
    address: tokenAddress ?? ADDRESSES.elyst,
    abi: elystAbi,
    functionName: "balanceOf",
    args: [provider ?? ZERO],
    chainId: meTestnet.id,
    query: { enabled: active && !!provider },
  });

  const baseBps = base.data !== undefined ? Number(base.data) : null;
  const discountBps = bps.data !== undefined ? Number(bps.data) : null;
  const minBalance = min.data ?? BigInt(0);
  const qualifies =
    active &&
    !!provider &&
    balance.data !== undefined &&
    balance.data >= minBalance &&
    discountBps !== null;
  const effectiveBps = qualifies ? discountBps : baseBps;

  return { baseBps, discountBps, minBalance, active, qualifies, effectiveBps };
}

export function bpsText(bps: number | null) {
  return bps === null ? "-" : `${bps / 100}%`;
}