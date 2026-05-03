import { motion } from 'framer-motion'
import {
  Shield, Lock, EyeOff, Zap, Cpu, Network,
  KeyRound, Fingerprint, CheckCircle2, ArrowRight,
  Server, Globe, Code2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function ArchitectureCard({ icon: Icon, title, description, color = '#F0B90B' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-xl p-6 hover:border-[#F0B90B]/20 transition-all"
    >
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}

function FlowStep({ number, title, desc, icon: Icon }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#F0B90B]" />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono text-[#F0B90B]">STEP {number}</span>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

const TS_CODE = `// PuffinPerpDex Arcium Integration
import { ArciumClient, Computation } from "@arciumconfidential/client";


const arcium = new ArciumClient({
  cluster: "testnet",
  solanaConnection: new Connection(clusterApiUrl("devnet")),
});

async function executePrivateTrade(tradeParams) {
  // 1. Encrypt trade parameters
  const encrypted = await arcium.encrypt({
    size: tradeParams.size,
    margin: tradeParams.margin,
    leverage: tradeParams.leverage,
  });

  // 2. Define confidential computation
  const computation = {
    programId: "ELEM_PERP_DEX_V1",
    inputs: encrypted.ciphertexts,
    computationCID: "QmArciumPerpDex123",
  };

  // 3. Submit to Arcium Testnet MPC cluster
  const computationId = await arcium.execute(computation);

  // 4. Wait for verifiable result
  const result = await arcium.awaitResult(computationId);

  // 5. Settle on Solana with proof
  await settleOnSolana({
    proof: result.proof,
    publicInputs: result.publicOutputs,
  });

  return { status: "executed", privacyPreserved: true, computationId };
}`

const RUST_CODE = `// Anchor smart contract with Arcium verification
use anchor_lang::prelude::*;

#[program]
pub mod elem_perp_dex {
    use super::*;

    pub fn open_position(
        ctx: Context<OpenPosition>,
        proof: ArciumProof,
        public_inputs: Vec<u64>,
    ) -> Result<()> {
        // Verify Arcium computation proof on-chain
        require!(
            arcium_verify::check_proof(proof, public_inputs),
            ErrorCode::InvalidProof
        );

        let position = &mut ctx.accounts.position;
        position.owner = ctx.accounts.trader.key();
        position.size = public_inputs[0];
        position.margin = public_inputs[1];
        position.leverage = public_inputs[2];
        position.liquidation_price = public_inputs[3];
        position.is_private = true;
        position.created_at = Clock::get()?.unix_timestamp;

        emit!(PositionOpened {
            owner: position.owner,
            commitment: proof.commitment,
        });

        Ok(())
    }
}`

export default function PrivacyArchitecture() {
  return (
    <div className="min-h-screen bg-[#0B0E11] py-8 px-4 sm:px-6">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/20 mb-4">
            <Shield className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm font-medium text-[#F0B90B]">Privacy Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            How Arcium Powers <span className="text-[#F0B90B] neon-text">PuffinPerpDex</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A deep dive into the confidential computation layer that makes private perpetual trading possible.
          </p>
        </motion.div>

        {/* What is Private */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <EyeOff className="w-6 h-6 text-[#F0B90B]" />
            What is Private?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Lock, title: 'Position Sizes', desc: 'The exact size of your trades is encrypted. Observers cannot determine if you\'re trading 1 SOL or 1000 SOL.', color: '#F0B90B' },
              { icon: KeyRound, title: 'Margin & Collateral', desc: 'Your margin requirements and collateral amounts are computed confidentially without revealing balances.', color: '#F0B90B' },
              { icon: Fingerprint, title: 'PnL Calculations', desc: 'Profit and loss math happens inside Arcium\'s MPC environment. Results are encrypted until you choose to reveal.', color: '#00FFB2' },
              { icon: Network, title: 'Order Matching', desc: 'Trade matching logic executes on encrypted inputs. Counterparties cannot inspect your order details.', color: '#FF4D6D' },
              { icon: Server, title: 'Liquidation Prices', desc: 'Liquidation thresholds are computed confidentially. Your risk parameters remain hidden from MEV searchers.', color: '#F0B90B' },
              { icon: Globe, title: 'Trade Metadata', desc: 'Timestamps, slippage tolerance, and other execution metadata can be obfuscated during routing.', color: '#F0B90B' },
            ].map((item, i) => (
              <ArchitectureCard key={i} {...item} />
            ))}
          </div>
        </section>

        {/* Why It Matters */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#F0B90B]" />
            Why It Matters
          </h2>
          <div className="glass-card rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">The Problem with Transparent DeFi</h3>
                <ul className="space-y-3">
                  {[
                    'MEV bots front-run large positions',
                    'Copy traders mirror successful strategies',
                    'Liquidators prey on undercollateralized positions',
                    'Market makers extract information before execution',
                    'Your entire trading history is public forever',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-[#FF4D6D] mt-0.5">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">The Arcium Solution</h3>
                <ul className="space-y-3">
                  {[
                    'Encrypted execution prevents front-running',
                    'Position sizes hidden from copycats',
                    'Confidential liquidation math protects your risk',
                    'No information leakage to market makers',
                    'You control what you reveal and when',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-[#00FFB2] mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Flow */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-[#F0B90B]" />
            Technical Execution Flow
          </h2>
          <div className="glass-card rounded-xl p-8 space-y-8">
            <FlowStep number="01" title="User Submits Trade" icon={Lock}
              desc="Trader opens a position on PuffinPerpDex. The trade parameters (size, leverage, side) are encrypted client-side using Arcium's encryption primitives." />
            <div className="ml-5 pl-5 border-l border-[#F0B90B]/20">
              <FlowStep number="02" title="Arcium MPC Network" icon={Network}
                desc="Encrypted inputs are sent to the Arcium Testnet MPC cluster. Multiple nodes receive shares but cannot reconstruct the plaintext alone." />
            </div>
            <div className="ml-5 pl-5 border-l border-[#F0B90B]/20">
              <FlowStep number="03" title="Confidential Computation" icon={Cpu}
                desc="The MPC nodes jointly compute: margin requirements, liquidation prices, and PnL updates on encrypted data. No single node sees the underlying values." />
            </div>
            <div className="ml-5 pl-5 border-l border-[#F0B90B]/20">
              <FlowStep number="04" title="Verifiable Output" icon={CheckCircle2}
                desc="Computation results are decrypted and verified on-chain. A zero-knowledge proof attests to correct execution without revealing inputs." />
            </div>
            <div className="ml-5 pl-5 border-l border-[#F0B90B]/20">
              <FlowStep number="05" title="Solana Settlement" icon={Server}
                desc="The verified result is written to Solana Devnet. Position state updates, but sensitive values remain encrypted in the trader's client." />
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-[#F0B90B]" />
            Integration Example
          </h2>
          <Tabs defaultValue="typescript" className="w-full">
            <TabsList className="bg-[#161A1E]/60 border border-[rgba(240,185,11,0.1)] mb-4">
              <TabsTrigger value="typescript" className="data-[state=active]:bg-[#F0B90B]/20 data-[state=active]:text-[#F0B90B]">
                TypeScript
              </TabsTrigger>
              <TabsTrigger value="rust" className="data-[state=active]:bg-[#F0B90B]/20 data-[state=active]:text-[#F0B90B]">
                Rust (Anchor)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="typescript">
              <div className="glass-card rounded-xl p-6 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono whitespace-pre">{TS_CODE}</pre>
              </div>
            </TabsContent>
            <TabsContent value="rust">
              <div className="glass-card rounded-xl p-6 overflow-x-auto">
                <pre className="text-sm text-gray-300 font-mono whitespace-pre">{RUST_CODE}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Privacy Score Explained */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#00FFB2]" />
            Privacy Score Explained
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { score: '90–100', label: 'Maximum', desc: 'All computations routed through Arcium. Position, PnL, and metadata fully encrypted. MEV protection active.', color: '#00FFB2' },
              { score: '60–89', label: 'Enhanced', desc: 'Core trade data encrypted. Some metadata visible for UX purposes. Basic MEV resistance.', color: '#F0B90B' },
              { score: '0–59', label: 'Standard', desc: 'Standard DEX behavior. No Arcium routing. All trade details visible on-chain. No MEV protection.', color: '#FF4D6D' },
            ].map((tier, i) => (
              <div key={i} className="glass-card rounded-xl p-5">
                <Badge className="mb-3" style={{ background: `${tier.color}20`, color: tier.color, borderColor: `${tier.color}40` }}>
                  {tier.score}
                </Badge>
                <h3 className="text-base font-semibold text-white mb-2">{tier.label}</h3>
                <p className="text-xs text-gray-400">{tier.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="text-center py-12 border-t border-[rgba(240,185,11,0.08)]">
          <p className="text-gray-500 mb-4">Want to learn more?</p>
          <a
            href="https://docs.arcium.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/20 text-[#F0B90B] hover:bg-[#F0B90B]/20 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            Read Arcium Documentation
          </a>
        </section>
      </div>
    </div>
  )
}
