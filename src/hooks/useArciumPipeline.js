import { useState, useCallback } from 'react'

/**
 * PuffinPerpDex — Arcium MPC Execution Pipeline (Simulated)
 * Visualizes the 5-step Arcium computation lifecycle in the UI.
 */
export const PIPELINE_STEPS = [
  { id:1, label:'Encrypting trade parameters',    detail:'Client-side FHE encryption of size, leverage, and side',                ms:800  },
  { id:2, label:'Submitting to Arcium MPC',       detail:'Encrypted payload distributed to MPC cluster nodes',                   ms:1000 },
  { id:3, label:'Confidential computation',       detail:'Margin, liquidation, and PnL calculated in encrypted domain',          ms:1200 },
  { id:4, label:'ZK-proof verification',          detail:'Verifiable result with zero-knowledge proof',                          ms:900  },
  { id:5, label:'Solana Devnet settlement',       detail:'Writing verifiable result to on-chain program',                        ms:600  },
]

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }

function makeTxSig() {
  const a = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  return Array.from({length:88}, () => a[Math.floor(Math.random()*58)]).join('')
}

function makeExecHash() {
  return '0x' + Array.from({length:64}, () => '0123456789abcdef'[Math.floor(Math.random()*16)]).join('')
}

function mockEncrypt(params) {
  return btoa(JSON.stringify({ ...params, _arc: true, _n: Math.random().toString(36).slice(2,10) }))
}

function mockCompute(params) {
  const sz  = parseFloat(params.size     || 1)
  const lev = parseFloat(params.leverage || 1)
  const ep  = parseFloat(params.entryPrice || 100)
  const lng = params.side === 'long'
  const margin   = (sz / lev).toFixed(4)
  const liqDist  = (1 / lev) * (lng ? 0.95 : 1.05)
  const liqPrice = lng ? (ep*(1-liqDist)).toFixed(2) : (ep*(1+liqDist)).toFixed(2)
  return { margin, liquidationPrice: liqPrice }
}

export function useArciumPipeline() {
  const [step,   setStep]   = useState(0)
  const [error,  setError]  = useState(null)
  const [result, setResult] = useState(null)

  const reset = useCallback(() => { setStep(0); setError(null); setResult(null) }, [])

  const run = useCallback(async (params) => {
    setError(null); setResult(null)
    try {
      setStep(1); await delay(PIPELINE_STEPS[0].ms)
      const encrypted = mockEncrypt(params)

      setStep(2); await delay(PIPELINE_STEPS[1].ms)

      setStep(3); await delay(PIPELINE_STEPS[2].ms)
      const computed = mockCompute(params)

      setStep(4); await delay(PIPELINE_STEPS[3].ms)
      const proof = { type:'Groth16', id:`zk-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, valid:true }

      setStep(5); await delay(PIPELINE_STEPS[4].ms)
      const txSig   = makeTxSig()
      const execHash = makeExecHash()

      const finalResult = {
        status: 'executed',
        encrypted,
        ...computed,
        proof,
        txSignature:     txSig,
        execHash,
        privacyPreserved:true,
        mevProtected:    true,
        settledAt:       new Date().toISOString(),
      }
      setResult(finalResult)
      setStep(6)
      return finalResult
    } catch (e) {
      setError(e.message || 'Pipeline failed')
      setStep(-1)
      throw e
    }
  }, [])

  return { step, isRunning:step>0&&step<6, isDone:step===6, isError:step===-1, error, result, run, reset }
}
