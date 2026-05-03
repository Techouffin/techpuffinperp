import { createContext, useContext, useState, useCallback } from 'react'

const ArciumPrivacyContext = createContext(null)

export function ArciumPrivacyProvider({ children }) {
  const [isPrivateMode, setIsPrivateMode] = useState(true)
  const [privacyScore, setPrivacyScore] = useState(92)
  const [mevProtectionEnabled, setMevProtectionEnabled] = useState(true)

  const togglePrivateMode = useCallback(() => {
    setIsPrivateMode(prev => {
      const next = !prev
      setPrivacyScore(next ? 92 : 30)
      return next
    })
  }, [])

  const toggleMevProtection = useCallback(() => {
    setMevProtectionEnabled(prev => !prev)
  }, [])

  const encryptTradeData = useCallback(async (data) => {
    await new Promise(r => setTimeout(r, 400))
    const mockEncrypted = btoa(JSON.stringify({ ...data, _arcium: true, _nonce: Math.random().toString(36) }))
    const mockProof = `arcium-proof-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    return { encrypted: mockEncrypted, proof: mockProof }
  }, [])

  const simulateArciumExecution = useCallback(async (_tradeParams) => {
    await new Promise(r => setTimeout(r, 600))
    return {
      status: 'executed',
      computationId: `arcium-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      privacyPreserved: true,
      obfuscatedSize: '***',
      obfuscatedMargin: '***',
      mevProtected: mevProtectionEnabled,
    }
  }, [mevProtectionEnabled])

  return (
    <ArciumPrivacyContext.Provider value={{
      isPrivateMode,
      togglePrivateMode,
      privacyScore,
      mevProtectionEnabled,
      toggleMevProtection,
      encryptTradeData,
      simulateArciumExecution,
    }}>
      {children}
    </ArciumPrivacyContext.Provider>
  )
}

export function useArciumPrivacy() {
  const context = useContext(ArciumPrivacyContext)
  if (!context) throw new Error('useArciumPrivacy must be used within ArciumPrivacyProvider')
  return context
}
