import { useReadContract } from "wagmi";
import { ADDRESSES, elyPayAbi } from "./contracts";
import { meTestnet } from "./chain";

// Reads the fee from the contract so the page always shows the current number.
export function useFeeText() {
  const { data } = useReadContract({
    address: ADDRESSES.elyPay,
    abi: elyPayAbi,
    functionName: "feeBps",
    chainId: meTestnet.id,
  });

  if (data === undefined) return "-";
  return `${Number(data) / 100}%`;
}