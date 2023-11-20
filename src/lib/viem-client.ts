import { createWalletClient, custom } from 'viem'
import { sepolia, mainnet } from 'viem/chains'

export const publicClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum)
})
