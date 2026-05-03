import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, TrendingUp, TrendingDown, Shield, EyeOff, Zap } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useArciumPrivacy } from '@/providers/arcium-privacy'
import { useMockLeaderboard } from '@/hooks/useMockTrades'

function RankBadge({ rank }) {
  if (rank === 1) return <Medal className="w-5 h-5 text-yellow-400" />
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
  return <span className="w-5 h-5 flex items-center justify-center text-xs text-gray-500 font-mono">{rank}</span>
}

function LeaderboardTable({ data }) {
  const { isPrivateMode } = useArciumPrivacy()

  if (!data?.length) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-4" />
        <p className="text-sm text-gray-500">No traders on the leaderboard yet</p>
        <p className="text-xs text-gray-600 mt-2">Be the first to start trading!</p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(240,185,11,0.08)] bg-[#161A1E]/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Rank</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400">Trader</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400">Total P&L</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400">Win Rate</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400">Trades</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400">Volume</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400">Privacy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(240,185,11,0.04)]">
            {data.map((trader, i) => {
              const pnl = parseFloat(trader.totalPnl || '0')
              const isProfit = pnl > 0
              const obfuscate = isPrivateMode && i > 2

              return (
                <motion.tr
                  key={trader.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`hover:bg-white/[0.02] transition-colors ${i < 3 ? 'bg-[#F0B90B]/[0.02]' : ''}`}
                >
                  <td className="px-4 py-3"><RankBadge rank={trader.rank || i + 1} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/20 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[#F0B90B]">
                          {trader.walletAddress?.slice(0, 2)}
                        </span>
                      </div>
                      <span className="text-sm font-mono text-gray-300">{trader.walletAddress}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-bold ${isProfit ? 'text-[#00FFB2]' : 'text-[#FF4D6D]'}`}>
                      {isProfit ? '+' : ''}{obfuscate ? '***' : pnl.toFixed(2)} USDC
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {parseFloat(trader.winRate || '0') >= 50
                        ? <TrendingUp className="w-3 h-3 text-[#00FFB2]" />
                        : <TrendingDown className="w-3 h-3 text-[#FF4D6D]" />}
                      <span className="text-sm text-gray-300">{obfuscate ? '**' : `${trader.winRate}%`}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-400">
                    {obfuscate ? '**' : trader.totalTrades}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-400">
                    {obfuscate ? '***' : `${parseFloat(trader.volumeTraded || '0').toFixed(1)} SOL`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className="text-[10px] border-[#F0B90B]/20 text-[#F0B90B] h-5">
                      <Shield className="w-2.5 h-2.5 mr-1" />
                      Arcium
                    </Badge>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const [timeframe, setTimeframe] = useState('all')
  const data = useMockLeaderboard()

  return (
    <div className="min-h-screen bg-[#0B0E11] py-8 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/20 mb-4">
            <Trophy className="w-4 h-4 text-[#F0B90B]" />
            <span className="text-sm font-medium text-[#F0B90B]">Top Traders</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Leaderboard</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Rankings based on total P&L. Privacy-protected via Arcium —
            traders can optionally obfuscate their stats.
          </p>
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Traders', value: data.length, icon: Trophy, color: '#F0B90B' },
            { label: 'Total Volume', value: '45.2K SOL', icon: Zap, color: '#F0B90B' },
            { label: 'Avg Win Rate', value: '54.3%', icon: TrendingUp, color: '#00FFB2' },
            { label: 'Private Trades', value: '87%', icon: EyeOff, color: '#F0B90B' },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <stat.icon className="w-5 h-5 mb-2" style={{ color: stat.color }} />
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Timeframe Tabs */}
        <Tabs value={timeframe} onValueChange={setTimeframe} className="mb-6">
          <TabsList className="bg-[#161A1E]/60 border border-[rgba(240,185,11,0.1)]">
            {['daily', 'weekly', 'all'].map(tf => (
              <TabsTrigger
                key={tf}
                value={tf}
                className="data-[state=active]:bg-[#F0B90B]/20 data-[state=active]:text-[#F0B90B]"
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}{tf === 'all' ? ' Time' : ''}
              </TabsTrigger>
            ))}
          </TabsList>
          {['daily', 'weekly', 'all'].map(tf => (
            <TabsContent key={tf} value={tf} className="mt-4">
              <LeaderboardTable data={data} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
