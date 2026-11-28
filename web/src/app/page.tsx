import Link from "next/link";
import CreateLinkForm from "@/components/CreateLinkForm";
import HeroShowcase from "@/components/HeroShowcase";
import { roadmap } from "@/lib/roadmap";

const icon = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <h1>Send a link. Get paid in USDC.</h1>
            <p className="lede">
              MEStation turns a payment into a simple link with the amount,
              the reason and a receipt. Hire people with your money held until
              the job is done. Built on the Meta Earth Hub testnet.
            </p>
            <div className="hero-cta">
              <a className="btn btn-mint" href="#create">
                Create a link
              </a>
              <Link className="btn btn-ghost" href="/explore">
                Find someone to hire
              </Link>
            </div>
          </div>
          <HeroShowcase />
        </div>
      </section>

      <div className="wrap">
        <div id="create" className="create">
          <CreateLinkForm />
        </div>

        <section className="facts-section">
          <div className="section-head">
            <h2>Simple for both sides</h2>
            <p>
              The person who gets paid and the person who pays see the same
              clear request.
            </p>
          </div>
          <div className="facts">
            <div className="fact">
              <span className="fact-icon">
                <svg {...icon}>
                  <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <h3>Non-custodial links</h3>
              <p>
                Payments go from the payer wallet to yours. We never hold your
                funds.
              </p>
            </div>
            <div className="fact">
              <span className="fact-icon">
                <svg {...icon}>
                  <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
                </svg>
              </span>
              <h3>Built on Meta Earth</h3>
              <p>
                Runs on the Meta Earth Hub testnet, an EVM-compatible network,
                with test funds only.
              </p>
            </div>
            <div className="fact">
              <span className="fact-icon">
                <svg {...icon}>
                  <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
                  <path d="M9 8h6M9 12h6" />
                </svg>
              </span>
              <h3>Public receipts</h3>
              <p>
                Every payment is recorded on chain, so you and your customer
                can both check it.
              </p>
            </div>
          </div>
        </section>

        <section id="how" className="how">
          <div className="section-head">
            <h2>How it works</h2>
          </div>
          <div className="steps">
            <div className="step">
              <span className="step-num">1</span>
              <h3>Create a link</h3>
              <p>
                Enter an amount and a short description. Confirm once in your
                wallet.
              </p>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <h3>Share it</h3>
              <p>Send the link or the QR code by message, email or chat.</p>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <h3>Get paid</h3>
              <p>
                The payer sends USDC. It lands in your wallet, and both of you
                get a receipt.
              </p>
            </div>
          </div>
        </section>

        <section id="why" className="ascend">
          <div className="section-head">
            <h2>Built for trust, not just payments</h2>
            <p>
              Payment links are the base. MEStation adds protection for the
              person paying and proof of work for the person getting paid.
            </p>
          </div>
          <div className="asc-grid">
            <div className="asc-item">
              <h3>Money held until the job is done</h3>
              <p>
                In a deal, the customer&apos;s payment waits in a contract. It
                is released when the work is confirmed, paid out automatically
                after the review time, or refunded if nothing is delivered. If
                there is a disagreement, both sides add evidence and a referee
                decides.
              </p>
            </div>
            <div className="asc-item">
              <h3>Reviews tied to real jobs</h3>
              <p>
                Only the customer of a finished deal can review it, and only
                once. The reputation contract is deployed on ME Hub testnet,
                and the review screens are being added.
              </p>
            </div>
            <div className="asc-item">
              <h3>Built around ME</h3>
              <p>
                MEStation runs on the Meta Earth Hub testnet. Support for ME ID
                verified profiles and an ME Pass mini-program is in
                development.
              </p>
            </div>
          </div>
          <div className="asc-actions">
            <Link className="btn btn-primary" href="/explore">
              Find someone to hire
            </Link>
            <Link className="btn btn-secondary" href="/get-mec">
              Get test MEC
            </Link>
          </div>
        </section>

        <section id="roadmap" className="roadmap">
          <div className="section-head">
            <h2>Roadmap</h2>
            <p>
              Payment links are the base. Here is what is live, what we are
              building, and what comes after.
            </p>
          </div>
          <div className="rm-track">
            {roadmap.map((stop) => (
              <div key={stop.key} className={`rm-col rm-${stop.key}`}>
                <span className="rm-node">
                  {stop.key === "live" && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#04201C"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  )}
                </span>
                <div className="rm-card">
                  <h3>{stop.phase}</h3>
                  <p className="rm-status">{stop.status}</p>
                  <ul className="rm-items">
                    {stop.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="cta">
          <div>
            <h2>Create your first payment link.</h2>
            <p>It takes one wallet confirmation.</p>
          </div>
          <a className="btn btn-mint" href="#create">
            Create a link
          </a>
        </section>
      </div>
    </>
  );
}