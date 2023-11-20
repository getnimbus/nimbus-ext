import { createWalletClient, custom } from 'viem'
import { goerli, mainnet } from 'viem/chains'

export const publicClient = createWalletClient({
  chain: goerli,
  transport: custom(window.ethereum)
})
