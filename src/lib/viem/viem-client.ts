import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';

let publicClient

if (mainnet && window?.ethereum) {
  publicClient = createWalletClient({
    chain: mainnet,
    transport: custom(window?.ethereum)
  })
}

export default publicClient;
