import { getBalance } from '@wagmi/core'
import { wagmiConfig } from './config'

type AllowedChainId = (typeof wagmiConfig)['chains'][number]['id']

export async function getChainBalance(
  address: `0x${string}`,
  chainId: AllowedChainId,
) {
  return getBalance(wagmiConfig, {
    address,
    chainId,
  })
}
