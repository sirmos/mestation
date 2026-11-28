import Link from "next/link";

export default function FaucetNote() {
  return (
    <div className="callout">
      <span>
        This is a testnet. You need a little free test MEC for network fees.
      </span>
      <Link className="btn btn-primary btn-sm" href="/get-mec">
        Get test MEC
      </Link>
    </div>
  );
}