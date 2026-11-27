"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { meTestnet } from "@/lib/chain";
import { OFFICIAL_FAUCET } from "@/lib/links";
import { fromMeAddress, isEvmAddress, toMeAddress } from "@/lib/meAddress";

type Converted = { label: string; value: string } | { error: string } | null;

function convert(input: string): Converted {
  const text = input.trim();
  if (!text) return null;
  try {
    if (text.toLowerCase().startsWith("0x")) {
      return { label: "ME address (me1...)", value: toMeAddress(text) };
    }
    return { label: "EVM address (0x...)", value: fromMeAddress(text) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid address" };
  }
}

const mono = { fontFamily: "monospace", wordBreak: "break-all" as const };

export function GetMecView() {
  const { address, isConnected } = useAccount();
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState("");

  const balance = useBalance({
    address,
    chainId: meTestnet.id,
    query: { enabled: Boolean(address), refetchInterval: 15_000 },
  });

  const mine = address && isEvmAddress(address) ? toMeAddress(address) : "";
  const result = convert(input);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      // Copying can be blocked by the browser. The address is still on screen.
    }
  }

  const balanceText = balance.data
    ? `${formatUnits(balance.data.value, balance.data.decimals)} ${balance.data.symbol}`
    : balance.isLoading
      ? "Checking..."
      : "Not available";

  return (
    <section>
      <h1>Get test MEC</h1>
      <p>
        The ME faucet asks for an ME address (me1...). Your wallet uses a 0x
        address. They are the same account written two ways, so convert yours
        here, then claim on the faucet.
      </p>

      <h2>Your wallet</h2>
      {isConnected && address ? (
        <>
          <p>EVM address</p>
          <p style={mono}>{address}</p>
          <p>ME address</p>
          <p style={mono}>{mine}</p>
          <button type="button" onClick={() => copy(mine)}>
            {copied === mine ? "Copied" : "Copy ME address"}
          </button>
          <p>
            Balance on {meTestnet.name}: <strong>{balanceText}</strong>
          </p>
        </>
      ) : (
        <p className="hint">Connect your wallet to see your ME address.</p>
      )}

      <h2>Convert any address</h2>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste a 0x... or me1... address"
        spellCheck={false}
        style={{ width: "100%" }}
      />
      {result && "error" in result && <p className="hint">{result.error}</p>}
      {result && "value" in result && (
        <>
          <p>{result.label}</p>
          <p style={mono}>{result.value}</p>
          <button type="button" onClick={() => copy(result.value)}>
            {copied === result.value ? "Copied" : "Copy"}
          </button>
        </>
      )}

      <h2>Claim</h2>
      <ol>
        <li>Open the official faucet and choose the Hub tab.</li>
        <li>Paste your ME address, then enter your email and the code.</li>
        <li>MEC can take up to 2 hours to arrive. The balance above updates on its own.</li>
      </ol>
      <p>
        <a href={OFFICIAL_FAUCET} target="_blank" rel="noreferrer">
          Open the ME faucet
        </a>
      </p>
    </section>
  );
}