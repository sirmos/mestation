import type { Metadata } from "next";
import Link from "next/link";
import { Newsreader, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import "./market.css";
import "./chat.css";
import "./ascend.css";
import "./misc.css";
import Providers from "./providers";
import Header from "@/components/Header";
import CurrencyPicker from "@/components/CurrencyPicker";
import { ADDRESSES } from "@/lib/contracts";
import { BRAND } from "@/lib/brand";
import { LINKS } from "@/lib/links";

const display = Newsreader({
  subsets: ["latin"],
  variable: "--ff-display",
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--ff-body",
});

export const metadata: Metadata = {
  title: `${BRAND.name}: ${BRAND.tagline}`,
  description:
    "Payment links and pay-when-done hiring in USDC, with disputes and reviews tied to real jobs. Built on the Meta Earth Hub testnet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <footer className="footer">
            <div className="wrap footer-inner">
              <span>
                {BRAND.name} on the Meta Earth Hub testnet. Built for the Meta
                Earth HARBOR Hackathon.
              </span>
              <span className="footer-links">
                <Link href="/#roadmap">Roadmap</Link>
                <Link href="/get-mec">Get test MEC</Link>
                <Link href="/policies">Policies</Link>
                <a href={LINKS.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a
                  href={`${LINKS.explorer}/address/${ADDRESSES.elyMarket}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contract
                </a>
                <a href={LINKS.explorer} target="_blank" rel="noreferrer">
                  Explorer
                </a>
              </span>
              <CurrencyPicker />
              <span className="footer-note">
                Prices in other currencies are estimates. Rates from{" "}
                <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">
                  Exchange Rate API
                </a>
                .
              </span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}