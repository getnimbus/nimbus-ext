import { createWalletClient, custom } from 'viem';
import { scrollSepolia } from "viem/chains";

let publicClient

if (window && window?.ethereum) {
  publicClient = createWalletClient({
    chain: scrollSepolia,
    transport: custom(window?.ethereum)
  })
}

export default publicClient;