"use client";

import { useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";
import { meTestnet } from "@/lib/chain";
import { OFFICIAL_FAUCET } from "@/lib/links";
import { shortAddress } from "@/lib/market";
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

const mono = {
  fontFamily: "monospace",
  fontSize: "0.85rem",
  wordBreak: "break-all" as const,
  textAlign: "right" as const,
};

export function GetMecView() {
  const { address, isConnected } = useAccount();
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState("");
  const [copiedOnce, setCopiedOnce] = useState(false);

  const balance = useBalance({
    address,
    chainId: meTestnet.id,
    query: { enabled: Boolean(address), refetchInterval: 15_000 },
  });

  const mine = address && isEvmAddress(address) ? toMeAddress(address) : "";
  const hasMec = !!balance.data && balance.data.value > BigInt(0);
  const result = convert(input);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      if (text === mine) setCopiedOnce(true);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      // The browser may block copying. The address is still on screen.
    }
  }

  const balanceText = balance.data
    ? `${formatUnits(balance.data.value, balance.data.decimals)} ${balance.data.symbol}`
    : balance.isLoading
      ? "Checking"
      : "Not available";

  const badge = !isConnected ? "Not connected" : hasMec ? "Ready" : "Needs MEC";

  return (
    <>
      <div className="panel">
        <div className="inv-head">
          <span className="inv-title">Test MEC</span>
          <span className={hasMec ? "status status-live" : "status"}>{badge}</span>
        </div>

        <h1 className="deal-title">Get free test MEC</h1>
        <p className="panel-note">
          MEC pays the small network fee for every action on MEStation. On the
          testnet it is free and has no value. The faucet asks for an ME
          address (me1...), so we convert your wallet address for you.
        </p>

        <div className="dsteps" style={{ marginTop: 16 }}>
          <div className={copiedOnce || hasMec ? "dstep done" : "dstep now"}>
            <strong>1. Copy</strong>
            Your ME address
          </div>
          <div
            className={hasMec ? "dstep done" : copiedOnce ? "dstep now" : "dstep"}
          >
            <strong>2. Claim</strong>
            On the ME faucet
          </div>
          <div className={hasMec ? "dstep done" : "dstep"}>
            <strong>3. Wait</strong>
            Up to 2 hours
          </div>
        </div>

        {isConnected && address ? (
          <>
            <dl className="inv-rows">
              <div className="row">
                <dt>Balance</dt>
                <dd>
                  <strong>{balanceText}</strong>
                </dd>
              </div>
              <div className="row">
                <dt>Wallet</dt>
                <dd title={address}>{shortAddress(address)}</dd>
              </div>
              <div className="row">
                <dt>ME address</dt>
                <dd style={mono}>{mine}</dd>
              </div>
            </dl>

            <div className="pay-actions">
              <button
                className="btn btn-primary btn-block"
                onClick={() => copy(mine)}
              >
                {copied === mine ? "Copied" : "Copy my ME address"}
              </button>
              <a
                className="btn btn-secondary btn-block"
                href={OFFICIAL_FAUCET}
                target="_blank"
                rel="noreferrer"
              >
                Open the ME faucet (Hub tab)
              </a>
            </div>

            <p className="hint" style={{ marginTop: 16 }}>
              Each address can claim 2 MEC a day (it resets at 00:00 UTC). Your
              balance updates here on its own. Test USDC is separate: you get
              it with a button when you pay or hire.
            </p>
          </>
        ) : (
          <p className="hint" style={{ marginTop: 16 }}>
            Connect your wallet to see your ME address and balance.
          </p>
        )}
      </div>

      <div className="panel">
        <h2>Convert an address</h2>
        <p className="panel-note">
          Paste a 0x address to get its ME form, or the other way around.
          Handy for teammates.
        </p>
        <div className="field">
          <label htmlFor="convert">Address</label>
          <input
            id="convert"
            className="input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="0x... or me1..."
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {result && "error" in result && (
          <p className="notice" role="alert" style={{ marginTop: 12 }}>
            {result.error}
          </p>
        )}

        {result && "value" in result && (
          <>
            <dl className="inv-rows">
              <div className="row">
                <dt>{result.label}</dt>
                <dd style={mono}>{result.value}</dd>
              </div>
            </dl>
            <div className="actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => copy(result.value)}
              >
                {copied === result.value ? "Copied" : "Copy"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}