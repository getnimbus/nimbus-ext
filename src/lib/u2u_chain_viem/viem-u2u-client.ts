import { createWalletClient, createPublicClient, http, custom } from 'viem';
import { u2uTestnet } from './u2uTestnet';

export const walletClient = createWalletClient({
  chain: u2uTestnet,
  transport: custom(window?.ethereum),
})

export const publicClient = createPublicClient({
  chain: u2uTestnet,
  transport: http("https://rpc-nebulas-testnet.uniultra.xyz", {
    batch: true, // https://viem.sh/docs/clients/transports/http.html
  }),
})
