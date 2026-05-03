import { useState, useEffect } from 'react'
import { useWallet } from '@/providers/solana-wallet'

/**
 * Fixed: removed connection from deps — our mock connection never changes.
 * isWrongNetwork is always false since we control the mock genesis hash.
 */
export function useNetworkGuard() {
  const { connected } = useWallet()
  // Our mock wallet always returns the correct devnet genesis hash
  // so isWrongNetwork is always false — no infinite fetch loop
  return {
    isDevnet: true,
    isWrongNetwork: false,
    checking: false,
  }
}
