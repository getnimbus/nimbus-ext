import { createWalletClient, custom } from 'viem'
import { lineaTestnet, mainnet } from 'viem/chains'

export const publicClient = createWalletClient({
  chain: lineaTestnet,
  transport: custom(window.ethereum)
})
