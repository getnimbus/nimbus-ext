import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

export const publicClient = createWalletClient({
  chain: mainnet,
  transport: custom(window.ethereum)
})
