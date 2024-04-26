import { createPublicClient, http } from 'viem';
import { scrollSepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: scrollSepolia,
  transport: http(undefined, {
    batch: true, // https://viem.sh/docs/clients/transports/http.html
  }),
})

export default publicClient
