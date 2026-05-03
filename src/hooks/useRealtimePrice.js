import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useRealtimePrice
 * Fetches live prices from Binance public REST API (no key, no CORS).
 * Falls back to CoinGecko if Binance fails.
 * Polls every 3 seconds for a live feel.
 *
 * Supported pairs mapped to their API symbols:
 *   SOL-PERP  → SOLUSDT  (Binance) / solana (CoinGecko)
 *   BTC-PERP  → BTCUSDT  / bitcoin
 *   ETH-PERP  → ETHUSDT  / ethereum
 *   JUP-PERP  → JUPUSDT  / jupiter-exchange-solana
 *   BONK-PERP → BONKUSDT / bonk
 */

const BINANCE_SYMBOLS = {
  'SOL-PERP':  'SOLUSDT',
  'BTC-PERP':  'BTCUSDT',
  'ETH-PERP':  'ETHUSDT',
  'JUP-PERP':  'JUPUSDT',
  'BONK-PERP': 'BONKUSDT',
}

const COINGECKO_IDS = {
  'SOL-PERP':  'solana',
  'BTC-PERP':  'bitcoin',
  'ETH-PERP':  'ethereum',
  'JUP-PERP':  'jupiter-exchange-solana',
  'BONK-PERP': 'bonk',
}

// Seed fallback prices (used until first fetch completes)
export const SEED_PRICES = {
  'SOL-PERP':  '145.00',
  'BTC-PERP':  '67000.00',
  'ETH-PERP':  '3200.00',
  'JUP-PERP':  '0.8000',
  'BONK-PERP': '0.00002800',
}

async function fetchBinance(pair) {
  const symbol = BINANCE_SYMBOLS[pair]
  if (!symbol) return null
  const res = await fetch(
    `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
    { signal: AbortSignal.timeout(5000) }
  )
  if (!res.ok) throw new Error('Binance error')
  const d = await res.json()
  return {
    price:     parseFloat(d.lastPrice),
    change24h: parseFloat(d.priceChangePercent),
    high24h:   parseFloat(d.highPrice),
    low24h:    parseFloat(d.lowPrice),
    volume24h: parseFloat(d.quoteVolume), // in USDT
  }
}

async function fetchCoinGecko(pair) {
  const id = COINGECKO_IDS[pair]
  if (!id) return null
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_high_24h=true&include_low_24h=true`,
    { signal: AbortSignal.timeout(8000) }
  )
  if (!res.ok) throw new Error('CoinGecko error')
  const d = await res.json()
  const coin = d[id]
  if (!coin) throw new Error('No data')
  return {
    price:     coin.usd,
    change24h: coin.usd_24h_change,
    high24h:   coin.usd_24h_high ?? coin.usd,
    low24h:    coin.usd_24h_low  ?? coin.usd,
    volume24h: coin.usd_24h_vol  ?? 0,
  }
}

/**
 * Main hook — call with the current pair string e.g. 'SOL-PERP'
 * Returns { price, change24h, high24h, low24h, volume24h, loading, error, source }
 */
export function useRealtimePrice(pair) {
  const [data, setData] = useState({
    price:     parseFloat(SEED_PRICES[pair] ?? '100'),
    change24h: 0,
    high24h:   0,
    low24h:    0,
    volume24h: 0,
    loading:   true,
    error:     null,
    source:    null,
  })

  const pairRef    = useRef(pair)
  const mountedRef = useRef(true)
  pairRef.current  = pair

  const fetchPrice = useCallback(async () => {
    const currentPair = pairRef.current
    try {
      // Try Binance first — fastest and most accurate
      const result = await fetchBinance(currentPair)
      if (!mountedRef.current) return
      if (result) {
        setData(prev => ({
          ...prev, ...result,
          loading: false, error: null, source: 'Binance',
        }))
        return
      }
    } catch {
      // Binance failed — try CoinGecko
    }
    try {
      const result = await fetchCoinGecko(currentPair)
      if (!mountedRef.current) return
      if (result) {
        setData(prev => ({
          ...prev, ...result,
          loading: false, error: null, source: 'CoinGecko',
        }))
      }
    } catch (e) {
      if (!mountedRef.current) return
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Price feed unavailable',
        source: null,
      }))
    }
  }, []) // no deps — uses ref

  useEffect(() => {
    mountedRef.current = true
    // Reset to seed price when pair changes
    setData({
      price:     parseFloat(SEED_PRICES[pair] ?? '100'),
      change24h: 0, high24h: 0, low24h: 0, volume24h: 0,
      loading: true, error: null, source: null,
    })

    fetchPrice()

    // Poll every 5 seconds — Binance rate limit is 1200 req/min
    const id = setInterval(fetchPrice, 5000)
    return () => {
      clearInterval(id)
      mountedRef.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair])

  return data
}

/**
 * useHistoricalPrices — fetches last N candles from Binance for the chart
 * Returns array of { time, price, volume }
 */
export async function fetchHistoricalPrices(pair, interval = '1m', limit = 80) {
  const symbol = BINANCE_SYMBOLS[pair]
  if (!symbol) return []
  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return []
    const candles = await res.json()
    // Binance kline: [openTime, open, high, low, close, volume, ...]
    return candles.map(c => ({
      time:   new Date(c[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open:   parseFloat(c[1]),
      high:   parseFloat(c[2]),
      low:    parseFloat(c[3]),
      price:  parseFloat(c[4]), // close price
      volume: parseFloat(c[5]),
    }))
  } catch {
    return []
  }
}
