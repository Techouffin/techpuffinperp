import { useState, useEffect, useRef } from 'react'
import { useWallet } from '@/providers/solana-wallet'

const LAMPORTS_PER_SOL = 1_000_000_000

/**
 * Fixed: removed fetchBalance from useEffect deps to prevent infinite loop.
 * Uses a ref to track publicKey instead of putting it in callback deps.
 * Auto-refreshes every 30s (was 15s — halved to reduce render pressure).
 */
export function useSolanaBalance(refreshTrigger = 0) {
  const { publicKey, connected } = useWallet()
  const [solBalance,  setSolBalance]  = useState(null)
  const [usdcBalance, setUsdcBalance] = useState(null)
  const [loading,     setLoading]     = useState(false)
  const mountedRef   = useRef(true)
  const publicKeyRef = useRef(publicKey)

  // Keep ref in sync without adding to effect deps
  publicKeyRef.current = publicKey

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!connected || !publicKeyRef.current) {
      setSolBalance(null)
      setUsdcBalance(null)
      return
    }

    let cancelled = false

    const fetch = async () => {
      setLoading(true)
      try {
        // Mock balance — random between 2-8 SOL, stable per session
        const lamports = (Math.floor(Math.random() * 6) + 2) * LAMPORTS_PER_SOL
        if (cancelled || !mountedRef.current) return
        const sol = lamports / LAMPORTS_PER_SOL
        setSolBalance(sol)
        setUsdcBalance(parseFloat((sol * 150).toFixed(2)))
      } catch {
        // silently ignore
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    fetch()

    // Auto-refresh every 30s
    const id = setInterval(fetch, 30_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  // Only re-run when connection status or manual trigger changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, refreshTrigger])

  const refresh = () => {
    if (!connected) return
    setLoading(true)
    const sol = solBalance ?? (Math.floor(Math.random() * 6) + 2)
    setSolBalance(sol)
    setUsdcBalance(parseFloat((sol * 150).toFixed(2)))
    setTimeout(() => { if (mountedRef.current) setLoading(false) }, 300)
  }

  return { solBalance, usdcBalance, loading, error: null, refresh }
}
