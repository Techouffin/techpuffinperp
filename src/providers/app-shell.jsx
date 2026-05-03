import { createContext, useContext, useRef } from 'react'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ToastContainer'

const AppShellContext = createContext(null)

/**
 * Fixed: removed useWallet and useNetworkGuard from this provider.
 * Both were causing re-render cascades on every price tick.
 * NetworkGuardModal removed — isWrongNetwork is always false with mock wallet.
 * toast ref is stable — doesn't cause re-renders on children.
 */
export function AppShellProvider({ children }) {
  const { toasts, toast, dismiss } = useToast()
  // Use a ref so the context value never changes reference
  const toastRef = useRef(toast)
  toastRef.current = toast

  // Stable object — never triggers consumer re-renders
  const value = useRef({
    toast: {
      success: (m, d) => toastRef.current.success(m, d),
      error:   (m, d) => toastRef.current.error(m, d),
      info:    (m, d) => toastRef.current.info(m, d),
      warn:    (m, d) => toastRef.current.warn(m, d),
    }
  }).current

  return (
    <AppShellContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </AppShellContext.Provider>
  )
}

export function useAppShell() {
  const ctx = useContext(AppShellContext)
  if (!ctx) throw new Error('useAppShell must be used inside AppShellProvider')
  return ctx
}
