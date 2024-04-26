import { createWalletClient, custom } from 'viem';
import { u2uTestnet } from './u2uTestnet';

let walletClient

if (window && window?.ethereum) {
  walletClient = createWalletClient({
    chain: u2uTestnet,
    transport: custom(window?.ethereum)
  })
}

export default walletClient