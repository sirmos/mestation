import Link from "next/link";
import ConnectButton from "./ConnectButton";
import Logo from "./Logo";
import Nav from "./Nav";

export default function Header() {
  return (
    <>
      <div className="banner">
        Testnet only. Funds on this network have no value.{" "}
        <Link href="/get-mec">Get free test MEC for network fees</Link>
      </div>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <Link href="/" className="brand" aria-label="Home">
            <Logo />
          </Link>
          <Nav />
          <ConnectButton />
        </div>
      </header>
    </>
  );
}