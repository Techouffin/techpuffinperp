import { AlertTriangle, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/**
 * Shown when the wallet is connected but NOT on Solana Devnet.
 * open = boolean controlled by parent (useNetworkGuard)
 */
export function NetworkGuardModal({ open }) {
  const handleSwitch = () => {
    // Phantom exposes a non-standard method; other wallets may not support this.
    // We guide the user with a link as fallback.
    try {
      window.solana?.request({ method: 'switchNetwork', params: { network: 'devnet' } })
    } catch (_) {
      // silently ignore; fallback link shown below
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent
        // Prevent closing by clicking outside – user MUST switch network
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
        className="max-w-sm"
      >
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-7 h-7 text-yellow-400" />
          </div>
          <DialogTitle className="text-center">Wrong Network Detected</DialogTitle>
          <DialogDescription className="text-center">
            ELEMPerp DEX runs exclusively on <span className="text-[#F0B90B] font-semibold">Solana Devnet</span>.
            Please switch your wallet network to continue trading.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Auto-switch attempt */}
          <Button
            onClick={handleSwitch}
            className="w-full btn-gradient text-[#161A1E] font-semibold rounded-xl hover:opacity-90"
          >
            Switch to Devnet Automatically
          </Button>

          {/* Manual fallback */}
          <a
            href="https://phantom.app/learn/solana/how-to-change-solana-networks"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            How to switch manually
          </a>
        </div>

        <p className="text-[10px] text-gray-600 text-center mt-4">
          Phantom → Settings → Network → Devnet
          <br />
          Solflare → Settings → Network → Devnet
        </p>
      </DialogContent>
    </Dialog>
  )
}
