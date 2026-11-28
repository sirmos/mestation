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

// The on-chain record of one deal, with a link to the explorer for each step.
export default function DealTimeline({ dealId }: { dealId: string }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);

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
              </div>
              <a
                className="btn btn-secondary btn-sm"
                href={explorerTx(e.tx)}
                target="_blank"
                rel="noreferrer"
              >
                View on explorer
              </a>
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