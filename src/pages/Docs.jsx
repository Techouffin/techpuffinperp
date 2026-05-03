import { motion } from 'framer-motion'
import {
  BookOpen, Wallet, Droplets, TrendingUp, Shield,
  ExternalLink, Code2, Terminal, AlertTriangle, Zap, Lock,
} from 'lucide-react'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'

export default function Docs() {
  return (
    <div className="min-h-screen bg-[#0B0E11] py-8 px-4 sm:px-6">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/20 mb-4">
            <BookOpen className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm font-medium text-[#F0B90B]">Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">PuffinPerpDex Documentation</h1>
          <p className="text-gray-400">Everything you need to know to trade privately on Solana.</p>
        </motion.div>

        {/* Quick Start */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#F0B90B]" />
            Quick Start
          </h2>
          <div className="glass-card rounded-xl p-6 space-y-6">
            {[
              {
                n: 1, icon: Wallet, color: '#F0B90B', title: 'Install a Solana Wallet',
                content: (
                  <>
                    Download{' '}
                    <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-[#F0B90B] hover:underline">Phantom</a>,{' '}
                    <a href="https://solflare.com" target="_blank" rel="noopener noreferrer" className="text-[#F0B90B] hover:underline">Solflare</a>, or{' '}
                    <a href="https://backpack.app" target="_blank" rel="noopener noreferrer" className="text-[#F0B90B] hover:underline">Backpack</a>.
                    {' '}Create or import a wallet and switch to Devnet mode.
                  </>
                ),
              },
              {
                n: 2, icon: Droplets, color: '#F0B90B', title: 'Get Devnet SOL',
                content: (
                  <>
                    Visit the{' '}
                    <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer" className="text-[#F0B90B] hover:underline">Solana Devnet Faucet</a>
                    {' '}and airdrop free SOL to your wallet. You need at least 1 SOL for trading.
                  </>
                ),
              },
              {
                n: 3, icon: Lock, color: '#00FFB2', title: 'Enable Private Mode',
                content: 'Toggle the Privacy switch in the navbar. This routes your trades through Arcium\'s confidential computation network. Your position sizes and PnL will be encrypted.',
              },
              {
                n: 4, icon: TrendingUp, color: '#F0B90B', title: 'Start Trading',
                content: 'Go to the Trade page, select Long or Short, set your leverage (1x–20x), and execute. Preview your trade before confirming.',
              },
            ].map(({ n, icon: Icon, color, title, content }) => (
              <div key={n} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#F0B90B]/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#F0B90B]">{n}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color }} />
                    {title}
                  </h3>
                  <p className="text-sm text-gray-400">{content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trading Guide */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#F0B90B]" />
            Trading Guide
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              {
                value: 'long-short', q: 'What are Long and Short positions?',
                a: 'Long means you profit when the price goes up. Short means you profit when the price goes down. On PuffinPerpDex, you trade perpetual contracts — you never own the underlying asset.',
              },
              {
                value: 'leverage', q: 'How does leverage work?',
                a: 'Leverage amplifies your exposure. At 10x leverage, a 1% price move results in a 10% PnL change. Higher leverage means higher risk — your position is liquidated if the price hits the liquidation level. PuffinPerpDex supports 1x to 20x leverage.',
              },
              {
                value: 'liquidation', q: 'What is liquidation?',
                a: 'Liquidation happens when your losses exceed your margin. The position is automatically closed to prevent further losses. On PuffinPerpDex, liquidation prices are computed confidentially via Arcium so MEV bots cannot frontrun your liquidation.',
              },
              {
                value: 'fees', q: 'What are the trading fees?',
                a: 'PuffinPerpDex charges a 0.05% taker fee and 0.02% maker fee. There is no funding rate on this testnet version. Fees are used to incentivize liquidity providers in the vAMM pool.',
              },
              {
                value: 'pairs', q: 'What trading pairs are available?',
                a: 'Currently supported: SOL-PERP, BTC-PERP, ETH-PERP, JUP-PERP, BONK-PERP. All prices are simulated via a mock oracle for this Devnet deployment.',
              },
            ].map(item => (
              <AccordionItem key={item.value} value={item.value} className="glass-card rounded-xl border-0 px-4">
                <AccordionTrigger className="text-sm font-semibold text-white hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-gray-400 pb-4">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Privacy Guide */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#F0B90B]" />
            Privacy Guide
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              {
                value: 'what-private', q: 'What data is kept private?',
                a: 'When Private Mode is enabled via Arcium, the following are encrypted: position sizes, margin requirements, PnL calculations, liquidation thresholds, and order matching details. Your wallet address is still public (required for settlement), but your strategy remains hidden.',
              },
              {
                value: 'how-arcium', q: 'How does Arcium protect my trades?',
                a: 'Arcium uses multi-party computation (MPC) and fully homomorphic encryption (FHE). Your trade data is encrypted before leaving your browser. Encrypted computations run on a distributed node network. Only the final result is decrypted on-chain, and a zero-knowledge proof verifies correctness without revealing inputs.',
              },
              {
                value: 'mev', q: 'What is MEV protection?',
                a: 'MEV (Maximal Extractable Value) refers to bots that front-run, back-run, or sandwich your trades. By encrypting trade details until execution, Arcium prevents bots from reading your order and profiting at your expense. Your liquidation price is also hidden, preventing predatory liquidations.',
              },
              {
                value: 'toggle', q: 'Can I turn privacy off?',
                a: 'Yes. The Privacy toggle in the navbar switches between Private Mode (Arcium-routed) and Public Mode (standard on-chain execution). Your privacy score updates in real time to reflect your current protection level.',
              },
            ].map(item => (
              <AccordionItem key={item.value} value={item.value} className="glass-card rounded-xl border-0 px-4">
                <AccordionTrigger className="text-sm font-semibold text-white hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-gray-400 pb-4">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Development */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#F0B90B]" />
            Development
          </h2>
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Clone &amp; Run Locally</h3>
              <div className="bg-[#161A1E] rounded-lg p-4 overflow-x-auto">
                <code className="text-xs text-gray-300 font-mono whitespace-pre">{`git clone https://github.com/elemperp/elemperp-dex.git
cd elemperp-dex
npm install
npm run dev`}</code>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Environment Variables</h3>
              <div className="bg-[#161A1E] rounded-lg p-4 overflow-x-auto">
                <code className="text-xs text-gray-300 font-mono whitespace-pre">{`VITE_SOLANA_NETWORK=devnet
VITE_ARCIUM_CLUSTER=testnet
VITE_RPC_URL=https://api.devnet.solana.com`}</code>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FF4D6D]/5 border border-[#FF4D6D]/10">
              <AlertTriangle className="w-4 h-4 text-[#FF4D6D] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">
                This is a hackathon project running on Devnet. Do not use mainnet funds.
                The Arcium integration uses the Testnet MPC cluster for demonstration.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#F0B90B]" />
            FAQ
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              { q: 'Is this on mainnet?', a: 'No. PuffinPerpDex runs on Solana Devnet with Arcium Testnet. This is a demonstration for hackathon judging and community feedback.' },
              { q: 'Can I lose real money?', a: 'No. Devnet SOL has no real value. Use the Solana Faucet to get free test tokens.' },
              { q: 'Where is the smart contract code?', a: 'The Anchor program is in the /programs directory. See the README for build and deploy instructions.' },
              { q: 'How do I report a bug?', a: 'Open an issue on GitHub or reach out on Twitter. We appreciate all feedback.' },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-xl border-0 px-4">
                <AccordionTrigger className="text-sm font-semibold text-white hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-gray-400 pb-4">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Useful Links */}
        <section className="text-center py-8 border-t border-[rgba(240,185,11,0.08)]">
          <p className="text-gray-500 mb-4">Useful Links</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Solana Docs', url: 'https://solana.com/docs', icon: ExternalLink },
              { label: 'Arcium Docs', url: 'https://docs.arcium.com/', icon: ExternalLink },
              { label: 'Devnet Faucet', url: 'https://faucet.solana.com/', icon: Droplets },
              { label: 'GitHub', url: '#', icon: Code2 },
            ].map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-[#F0B90B] hover:border-[#F0B90B]/30 transition-all"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
