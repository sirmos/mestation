"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { meTestnet } from "@/lib/chain";

function short(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type Eth = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export default function ConnectButton() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: switching } = useSwitchChain();
  const [problem, setProblem] = useState("");

  async function switchOrAdd() {
    setProblem("");
    try {
      await switchChainAsync({ chainId: meTestnet.id });
      return;
    } catch {
      // The wallet may not know this network yet. Ask it to add it.
    }

    const ethereum = (window as unknown as { ethereum?: Eth }).ethereum;
    if (!ethereum) {
      setProblem("No wallet found in this browser.");
      return;
    }

    try {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${meTestnet.id.toString(16)}`,
            chainName: meTestnet.name,
            nativeCurrency: meTestnet.nativeCurrency,
            rpcUrls: [meTestnet.rpcUrls.default.http[0]],
            blockExplorerUrls: [meTestnet.blockExplorers.default.url],
          },
        ],
      });
    } catch {
      setProblem("The wallet did not add the network. Try again.");
    }
  }

  if (!isConnected) {
    return (
      <button
        className="btn btn-primary"
        disabled={isPending}
        onClick={() => connect({ connector: connectors[0] })}
      >
        {isPending ? "Check your wallet" : "Connect wallet"}
      </button>
    );
  }

  if (chainId !== meTestnet.id) {
    return (
      <>
        <button
          className="btn btn-primary"
          disabled={switching}
          title={problem || undefined}
          onClick={switchOrAdd}
        >
          {problem ? "Try again: switch to ME Hub" : "Switch to ME Hub"}
        </button>
      </>
    );
  }

  return (
    <button
      className="btn btn-secondary"
      title="Disconnect"
      onClick={() => disconnect()}
    >
      <span className="dot" aria-hidden="true" />
      {short(address as string)}
    </button>
  );
}