"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { BaseError } from "viem";
import type { Address } from "viem";
import { meTestnet } from "@/lib/chain";
import { fetchEvents } from "@/lib/events";
import { feeOverrides } from "@/lib/gas";
import { shortAddress } from "@/lib/market";
import { REPUTATION_ADDRESS, reputationAbi } from "@/lib/reputation";

function niceError(err: unknown) {
  if (err instanceof BaseError) {
    const m = err.shortMessage;
    if (m.includes("not been authorized")) {
      return "This account is not connected to the site. In MetaMask, connect this account to MEStation, then try again.";
    }
    if (m.includes("User rejected")) return "You cancelled the request in your wallet.";
    if (m.includes("exceeds the balance") || m.includes("insufficient funds")) {
      return "Not enough MEC for the network fee. Use the free test MEC link at the top of the page.";
    }
    return m;
  }
  return "Something went wrong. Try again.";
}

function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span
      aria-label={`${value.toFixed(1)} out of 5`}
      style={{ color: "#b7791f", letterSpacing: "0.12em", fontSize: "1.1rem" }}
    >
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </span>
  );
}

// Shown on a deal page once the deal is paid out or resolved.
export function ReviewPanel({
  dealId,
  customer,
  status,
}: {
  dealId: bigint;
  customer: Address;
  provider: Address;
  status: number;
}) {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: meTestnet.id });
  const finished = status === 3 || status === 6;

  const reviewedQuery = useReadContract({
    address: REPUTATION_ADDRESS,
    abi: reputationAbi,
    functionName: "reviewed",
    args: [dealId],
    chainId: meTestnet.id,
    query: { enabled: finished },
  });

  const reviewed = reviewedQuery.data === true;

  const reviewQuery = useReadContract({
    address: REPUTATION_ADDRESS,
    abi: reputationAbi,
    functionName: "getReview",
    args: [dealId],
    chainId: meTestnet.id,
    query: { enabled: finished && reviewed },
  });

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [localError, setLocalError] = useState("");

  const {
    writeContract,
    data: hash,
    isPending: signing,
    error: writeError,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: confirming,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  const txHash = receipt?.transactionHash;

  useEffect(() => {
    if (receipt) reviewedQuery.refetch();
    // Run once for each confirmed transaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txHash]);

  if (!finished) return null;

  const isCustomer =
    !!address && address.toLowerCase() === customer.toLowerCase();
  const busy = signing || confirming;
  const review = reviewQuery.data;

  const errorText =
    localError ||
    (writeError ? niceError(writeError) : "") ||
    (receiptError ? niceError(receiptError) : "") ||
    (receipt?.status === "reverted"
      ? "The review was rejected. Only the customer of a finished deal can review it, once."
      : "");

  async function submit() {
    setLocalError("");
    if (rating < 1) {
      setLocalError("Pick a rating from 1 to 5 stars.");
      return;
    }
    if (!publicClient) {
      setLocalError("The network is not ready. Try again in a moment.");
      return;
    }
    try {
      const fees = await feeOverrides(publicClient);
      writeContract({
        address: REPUTATION_ADDRESS,
        abi: reputationAbi,
        functionName: "postReview",
        args: [dealId, rating, comment.trim()],
        chainId: meTestnet.id,
        ...fees,
      });
    } catch (err) {
      setLocalError(niceError(err));
    }
  }

  return (
    <div className="panel">
      <h2>Review</h2>

      {reviewedQuery.isLoading ? (
        <p className="panel-note">Checking for a review.</p>
      ) : reviewed && review ? (
        <>
          <p>
            <Stars value={review.rating} />{" "}
            <span className="hint">{review.rating} out of 5</span>
          </p>
          {review.comment && <p className="pv-bio">{review.comment}</p>}
          <p className="hint">
            Written by the customer of this deal and saved on the chain.
          </p>
        </>
      ) : isCustomer ? (
        <>
          <p className="panel-note">
            How did it go? Your review is saved on the chain and shown on the
            provider&apos;s profile. You can leave one review for this deal.
          </p>

          <div
            role="radiogroup"
            aria-label="Rating"
            style={{ display: "flex", gap: 6, margin: "12px 0" }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                className={
                  rating >= n ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"
                }
                disabled={busy}
                onClick={() => setRating(n)}
              >
                {n} ★
              </button>
            ))}
          </div>

          <div className="field">
            <label htmlFor="review-comment">Comment (optional)</label>
            <textarea
              id="review-comment"
              className="input"
              maxLength={280}
              placeholder="A short note about the work."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {errorText && (
            <p className="notice" role="alert" style={{ marginTop: 12 }}>
              {errorText}
            </p>
          )}

          <button
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            disabled={busy}
            onClick={submit}
          >
            {signing
              ? "Confirm in your wallet"
              : confirming
                ? "Posting review"
                : "Post review"}
          </button>
        </>
      ) : (
        <p className="panel-note">
          No review yet. Only the customer of a finished deal can leave one.
        </p>
      )}
    </div>
  );
}

type ReviewItem = {
  dealId: string;
  customer: string;
  rating: number;
  comment: string;
  order: number;
};

// Shown on a profile: the average and the latest comments.
export function ProfileReviews({ provider }: { provider: Address }) {
  const countQuery = useReadContract({
    address: REPUTATION_ADDRESS,
    abi: reputationAbi,
    functionName: "reviewCount",
    args: [provider],
    chainId: meTestnet.id,
  });

  const sumQuery = useReadContract({
    address: REPUTATION_ADDRESS,
    abi: reputationAbi,
    functionName: "ratingSum",
    args: [provider],
    chainId: meTestnet.id,
  });

  const count = Number(countQuery.data ?? 0);
  const sum = Number(sumQuery.data ?? 0);
  const average = count > 0 ? sum / count : 0;

  const [items, setItems] = useState<ReviewItem[]>([]);

  useEffect(() => {
    if (count === 0) return;
    let cancelled = false;

    async function load() {
      try {
        const events = await fetchEvents("reputation", "ReviewPosted", {
          provider: provider.toLowerCase(),
        });
        const list: ReviewItem[] = events
          .map((e) => ({
            dealId: String(e.args.dealId ?? ""),
            customer: String(e.args.customer ?? ""),
            rating: Number(e.args.rating ?? 0),
            comment: String(e.args.comment ?? ""),
            order: e.block * 1000 + e.logIndex,
          }))
          .sort((a, b) => b.order - a.order)
          .slice(0, 5);
        if (!cancelled) setItems(list);
      } catch {
        // The totals above still show if the comments cannot be loaded.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [provider, count]);

  return (
    <div style={{ marginTop: 16 }}>
      {count === 0 ? (
        <p className="hint">
          No reviews yet. Only customers of finished deals can leave one.
        </p>
      ) : (
        <>
          <p>
            <Stars value={average} /> <strong>{average.toFixed(1)}</strong>{" "}
            <span className="hint">
              from {count} {count === 1 ? "review" : "reviews"}
            </span>
          </p>
          <div className="svc-list">
            {items.map((r) => (
              <div className="svc" key={`${r.dealId}-${r.order}`}>
                <div>
                  <p className="svc-title">
                    <Stars value={r.rating} />
                  </p>
                  {r.comment && <p className="svc-price">{r.comment}</p>}
                  <p className="hint">
                    {shortAddress(r.customer)} ·{" "}
                    <Link href={`/deal/${r.dealId}`}>Deal {r.dealId}</Link>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}