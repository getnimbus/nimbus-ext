import { createPublicClient, http } from 'viem';
import { u2uTestnet } from './u2uTestnet';

const publicClient = createPublicClient({
  chain: u2uTestnet,
  transport: http("https://rpc-nebulas-testnet.uniultra.xyz", {
    batch: true, // https://viem.sh/docs/clients/transports/http.html
  }),
})

export default publicClient
