import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import {
  Chain,
  RainbowKitProvider,
  getDefaultWallets,
  midnightTheme,
} from "@rainbow-me/rainbowkit";
import { createConfig, WagmiConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { get_stage } from "@/utils";
import { createPublicClient, http } from "viem";
import { configureChains } from "wagmi";
import { alchemyProvider } from "@wagmi/core/providers/alchemy";

const networks = get_stage() === "production" ? [mainnet] : [sepolia];

const { chains } = configureChains(networks as Chain[], [
  alchemyProvider({ apiKey: process.env.ALCHEMY_ID_MAINNET || "" }),
]);

const { connectors } = getDefaultWallets({
  appName: "ColorHueState",
  projectId: "1f111cfa89ffd372a79b7a99e9ab38f2",
  chains,
});

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: networks[0],
    transport: http(),
  }),
  connectors,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider theme={midnightTheme()} chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
