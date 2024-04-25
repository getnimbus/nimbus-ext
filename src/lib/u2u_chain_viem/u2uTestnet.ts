import { defineChain } from "viem";

export const u2uTestnet = /*#__PURE__*/ defineChain({
  id: 2484,
  name: "U2U Nebulas Testnet",
  network: "nebulas-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "U2U",
    symbol: "U2U",
  },
  rpcUrls: {
    default: { http: ["https://rpc-nebulas-testnet.uniultra.xyz/"] },
    public: { http: ["https://rpc-nebulas-testnet.uniultra.xyz/"] },
  },
  blockExplorers: {
    default: { name: "NebulasTestnet", url: "https://testnet.u2uscan.xyz/" },
  },
  testnet: true,
});
