"use client";

import { useEffect, useState } from "react";
import { ADDRESSES } from "@/lib/contracts";
import { fetchEvents } from "@/lib/events";
import { explorerAddress, explorerTx } from "@/lib/links";

const STEPS = [
  { event: "DealCreated", label: "Payment held in the contract" },
  { event: "DealDelivered", label: "Marked as delivered" },
  { event: "DealReleased", label: "Paid out to the provider" },
  { event: "DealRefunded", label: "Refunded to the customer" },
  { event: "DisputeOpened", label: "Dispute opened" },
  { event: "DisputeResolved", label: "Dispute resolved" },
];

type Entry = { label: string; tx: string; order: number };

function shortHash(hash: string) {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

// The on-chain record of one deal: every step with its transaction hash.
export default function DealTimeline({ dealId }: { dealId: string }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const results = await Promise.all(
          STEPS.map((s) => fetchEvents("market", s.event, { id: dealId }))
        );
        const list: Entry[] = [];
        results.forEach((events, i) => {
          for (const e of events) {
            list.push({
              label: STEPS[i].label,
              tx: e.tx,
              order: e.block * 1000 + e.logIndex,
            });
          }
        });
        list.sort((a, b) => a.order - b.order);
        if (!cancelled) setEntries(list);
      } catch {
        if (!cancelled) setEntries([]);
      }
    }

    load();
    const timer = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [dealId]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      // The browser may block copying. The hash is still on screen.
    }
  }

  return (
    <div className="panel">
      <h2>On-chain record</h2>
      <p className="panel-note">
        Every step of this deal is a public transaction on ME Hub testnet.
      </p>

      {entries === null ? (
        <p className="hint">Loading the record.</p>
      ) : entries.length === 0 ? (
        <p className="hint">
          Transactions appear here once the directory has caught up with the
          chain. Try again in a minute.
        </p>
      ) : (
        <div className="svc-list">
          {entries.map((e, i) => (
            <div className="svc" key={`${e.tx}-${i}`}>
              <div>
                <p className="svc-title">{e.label}</p>
                <p
                  className="hint"
                  title={e.tx}
                  style={{ fontFamily: "monospace" }}
                >
                  {shortHash(e.tx)}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => copy(e.tx)}
                >
                  {copied === e.tx ? "Copied" : "Copy hash"}
                </button>
                <a
                  className="btn btn-secondary btn-sm"
                  href={explorerTx(e.tx)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Explorer
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="hint" style={{ marginTop: 12 }}>
        <a href={explorerAddress(ADDRESSES.elyMarket)} target="_blank" rel="noreferrer">
          View the deal contract on the explorer
        </a>
      </p>
    </div>
  );
}