import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Shield, TrendingUp, Lock, EyeOff, Zap,
  ChevronRight, BarChart3, Globe, Cpu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

function FeatureCard({ icon: Icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card rounded-xl p-6 hover:border-[#F0B90B]/30 transition-all duration-300 group"
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/20 flex items-center justify-center mb-4 group-hover:from-[#F0B90B]/30 group-hover:to-[#F0B90B]/30 transition-all">
        <Icon className="w-6 h-6 text-[#F0B90B]" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0E11]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F0B90B]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F0B90B]/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F0B90B]/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/20 mb-8">
              <Shield className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">Privacy-First Perpetual DEX on Solana</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Trade Without</span>
              <br />
              <span className="text-[#F0B90B] neon-text">Compromise</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The first perpetual DEX with Arcium-powered confidential computation.
              Trade with encrypted positions, hidden PnL, and MEV-resistant execution.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/trade">
                <Button size="lg" className="btn-gradient text-[#161A1E] font-semibold px-8 py-6 text-base rounded-xl hover:opacity-90 transition-all glow-cyan">
                  Start Trading
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/privacy-architecture">
                <Button variant="outline" size="lg" className="border-[#F0B90B]/30 text-[#F0B90B] hover:bg-[#F0B90B]/10 px-8 py-6 text-base rounded-xl">
                  <Shield className="w-5 h-5 mr-2" />
                  How Privacy Works
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { label: 'Total Volume', value: '$12.4M', icon: BarChart3 },
              { label: 'Active Traders', value: '2,847', icon: Globe },
              { label: 'Privacy Score', value: '92/100', icon: Shield },
              { label: 'Pairs Available', value: '15+', icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-xl p-4 text-center">
                <stat.icon className="w-5 h-5 text-[#F0B90B] mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Arcium Section */}
      <section className="py-24 relative">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/20 mb-6">
              <Cpu className="w-4 h-4 text-[#F0B90B]" />
              <span className="text-sm font-medium text-[#F0B90B]">Powered by Arcium</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Confidential Computation</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Arcium enables fully homomorphic encryption for on-chain computations,
              ensuring your trading data remains private while being verifiable.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard icon={EyeOff} title="Hidden Positions" description="Your position sizes and margin requirements are encrypted on-chain. No one can see how much you're trading." delay={0.1} />
            <FeatureCard icon={Lock} title="Encrypted PnL" description="Your profit and loss calculations happen inside confidential compute environments. PnL remains private until you choose to reveal." delay={0.2} />
            <FeatureCard icon={Zap} title="MEV Protection" description="Arcium's privacy layer prevents front-running and sandwich attacks by obfuscating trade details during execution." delay={0.3} />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-t border-[rgba(240,185,11,0.06)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Built for Serious Traders</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Professional-grade trading infrastructure with the privacy guarantees you deserve.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, title: 'Long / Short', desc: 'Trade both directions with up to 20x leverage on perpetual contracts' },
              { icon: BarChart3, title: 'Hybrid Model', desc: 'Orderbook UI with vAMM backend for deep liquidity and tight spreads' },
              { icon: Shield, title: 'Privacy Toggle', desc: 'Switch between transparent and private mode for every trade' },
              { icon: Globe, title: 'Leaderboard', desc: 'Compete with other traders while optionally hiding your strategy' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 hover:border-[#F0B90B]/20 transition-all"
              >
                <feature.icon className="w-8 h-8 text-[#F0B90B] mb-4" />
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-[rgba(240,185,11,0.06)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400">Three simple steps to private perpetual trading</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect Wallet', desc: 'Link your Solana wallet (Phantom, Solflare). Auto-detects installed wallets.' },
              { step: '02', title: 'Enable Privacy', desc: 'Toggle Arcium private mode. Your trades will be routed through confidential computation nodes.' },
              { step: '03', title: 'Start Trading', desc: 'Open long or short positions with leverage. Your PnL and position sizes stay encrypted.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i === 0 ? -20 : i === 2 ? 20 : 0, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                <div className="glass-card rounded-xl p-8 h-full">
                  <div className="text-4xl font-bold text-[#F0B90B]/20 mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 text-[#F0B90B]/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[rgba(240,185,11,0.06)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-10 sm:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0B90B]/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F0B90B]/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Trade Privately?</h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Join the first privacy-focused perpetual DEX on Solana. Your strategy is yours alone.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/trade">
                  <Button size="lg" className="btn-gradient text-[#161A1E] font-semibold px-8 py-6 text-base rounded-xl hover:opacity-90 glow-cyan">
                    Launch App
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/docs">
                  <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/5 px-8 py-6 text-base rounded-xl">
                    Read Docs
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
