import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { meTestnet } from "./chain";

export const wagmiConfig = createConfig({
  chains: [meTestnet],
  connectors: [injected()],
  multiInjectedProviderDiscovery: false,
  transports: {
    [meTestnet.id]: http(),
  },
  ssr: true,
});