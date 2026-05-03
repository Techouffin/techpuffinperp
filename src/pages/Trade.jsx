import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet, WalletMultiButton } from '@/providers/solana-wallet'

import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Zap, Shield, EyeOff, Eye,
  Lock, History, Layers, AlertTriangle, ChevronDown,
  Info, Target, StopCircle, Radio, Copy, Check, HelpCircle,
  Wifi, WifiOff,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartTooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { Input }  from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge }  from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useArciumPrivacy } from '@/providers/arcium-privacy'
import { useAppShell }      from '@/providers/app-shell'
import { useMockTrades }    from '@/hooks/useMockTrades'
import { useArciumPipeline } from '@/hooks/useArciumPipeline'
import { useSolanaBalance }  from '@/hooks/useSolanaBalance'
import { useNetworkGuard }   from '@/hooks/useNetworkGuard'
import { useRealtimePrice, fetchHistoricalPrices, SEED_PRICES } from '@/hooks/useRealtimePrice'
import { ArciumPipelineTracker, ArciumPipelineModal } from '@/components/ArciumPipelineTracker'
import { WalletBalanceDisplay }  from '@/components/WalletBalanceDisplay'

/* ─────────────────────────── CONSTANTS ─────────────────────────── */
const PAIRS       = ['SOL-PERP','BTC-PERP','ETH-PERP','JUP-PERP','BONK-PERP']
const BASE_PRICES = { 'SOL-PERP':145.32,'BTC-PERP':67420,'ETH-PERP':3281.5,'JUP-PERP':0.842,'BONK-PERP':0.0000284 }
const VOLATILITY  = { 'SOL-PERP':0.6,'BTC-PERP':80,'ETH-PERP':4,'JUP-PERP':0.002,'BONK-PERP':0.0000008 }
const TAKER_FEE   = 0.0005   // 0.05%
const MAKER_FEE   = 0.0002   // 0.02%
const LS_KEY      = 'puffinperpdex_state_v2'

/* ─────────────────────────── DEMO SEED DATA ─────────────────────── */
// Pre-loaded positions shown to first-time visitors (feature #11)
function makeDemoPositions() {
  return [
    {
      id: -1, side:'long', pair:'SOL-PERP', entryPrice:'138.40',
      size:'12.5', leverage:5, margin:'2.5', liquidationPrice:'113.00',
      orderType:'market', stopLoss:'130.00', takeProfit:'165.00',
      isPrivate:true, privacyScore:92, status:'open', createdAt:new Date(Date.now()-3600000),
    },
    {
      id: -2, side:'short', pair:'BTC-PERP', entryPrice:'69200.00',
      size:'0.08', leverage:3, margin:'0.027', liquidationPrice:'78900.00',
      orderType:'limit', stopLoss:'72000.00', takeProfit:'63000.00',
      isPrivate:true, privacyScore:92, status:'open', createdAt:new Date(Date.now()-7200000),
    },
    {
      id: -3, side:'long', pair:'ETH-PERP', entryPrice:'3180.00',
      size:'1.5', leverage:8, margin:'0.1875', liquidationPrice:'2830.00',
      orderType:'market', stopLoss:null, takeProfit:'3600.00',
      isPrivate:false, privacyScore:30, status:'open', createdAt:new Date(Date.now()-1800000),
    },
  ]
}

function makeDemoHistory() {
  return [
    { id:-10, side:'long', pair:'SOL-PERP', size:'8.0', entryPrice:'132.10', exitPrice:'144.80', pnl:'101.60', isPrivate:true, createdAt:new Date(Date.now()-86400000), closedAt:new Date(Date.now()-82800000) },
    { id:-11, side:'short', pair:'ETH-PERP', size:'2.0', entryPrice:'3350.00', exitPrice:'3280.00', pnl:'140.00', isPrivate:true, createdAt:new Date(Date.now()-172800000), closedAt:new Date(Date.now()-169200000) },
    { id:-12, side:'long', pair:'BTC-PERP', size:'0.05', entryPrice:'65400.00', exitPrice:'64100.00', pnl:'-65.00', isPrivate:false, createdAt:new Date(Date.now()-259200000), closedAt:new Date(Date.now()-255600000) },
  ]
}

/* ─────────────────────────── HELPERS ───────────────────────────── */
function fmt(n,d=2){
  if(n===null||n===undefined)return'—'
  const v=parseFloat(n)
  if(isNaN(v))return'—'
  if(Math.abs(v)<0.001)return v.toFixed(8)
  if(Math.abs(v)>10000)return v.toLocaleString(undefined,{maximumFractionDigits:2})
  return v.toFixed(d)
}
function shortAddr(a){return a?`${a.slice(0,4)}…${a.slice(-4)}`:''}
function makeArciumHash(){
  const c='0123456789abcdef'
  return'0x'+Array.from({length:64},()=>c[Math.floor(Math.random()*16)]).join('')
}
function arciumExplorerUrl(h){return`https://explorer.arcium.com/computations/${h}`}

/* live funding rate: cycles through realistic values */
function useFundingRate(){
  const [rate,setRate]=useState(()=>(Math.random()*0.03-0.01).toFixed(4))
  useEffect(()=>{
    const id=setInterval(()=>{
      setRate((prev)=>{
        const delta=(Math.random()-0.5)*0.002
        return Math.max(-0.05,Math.min(0.05,parseFloat(prev)+delta)).toFixed(4)
      })
    },8000)
    return()=>clearInterval(id)
  },[])
  return parseFloat(rate)
}

/* animated price flash hook (feature #10) */
function usePriceFlash(price){
  const [flash,setFlash]=useState(null)
  const prev=useRef(price)
  const timerRef=useRef(null)
  useEffect(()=>{
    if(parseFloat(price)>parseFloat(prev.current)) setFlash('up')
    else if(parseFloat(price)<parseFloat(prev.current)) setFlash('down')
    prev.current=price
    // Clear any pending timer before setting a new one
    clearTimeout(timerRef.current)
    timerRef.current=setTimeout(()=>setFlash(null),400)
    return()=>clearTimeout(timerRef.current)
  },[price])
  return flash
}

/* copy to clipboard (feature #9) */
function useCopy(){
  const [copied,setCopied]=useState(false)
  const copy=useCallback((text)=>{
    navigator.clipboard.writeText(text).then(()=>{
      setCopied(true)
      setTimeout(()=>setCopied(false),1800)
    })
  },[])
  return{copied,copy}
}

/* localStorage persistence (feature #1) */
function loadPersistedState(walletKey){
  try{
    const raw=localStorage.getItem(`${LS_KEY}_${walletKey}`)
    if(!raw)return null
    const s=JSON.parse(raw)
    // Re-hydrate dates
    s.positions=(s.positions||[]).map(p=>({...p,createdAt:new Date(p.createdAt)}))
    s.history=(s.history||[]).map(h=>({...h,createdAt:new Date(h.createdAt),closedAt:h.closedAt?new Date(h.closedAt):null}))
    return s
  }catch{return null}
}
function persistState(walletKey,positions,history){
  try{localStorage.setItem(`${LS_KEY}_${walletKey}`,JSON.stringify({positions,history}))}catch{}
}

/* chart data */
function makeChartData(pair,pts=80){
  let p=BASE_PRICES[pair];const v=VOLATILITY[pair];const now=Date.now();const d=[]
  for(let i=pts;i>=0;i--){
    p=Math.max(p+(Math.random()-0.48)*v,0.000001)
    d.push({time:new Date(now-i*60000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),price:parseFloat(p.toFixed(p<0.01?8:2)),volume:Math.floor(Math.random()*8000)+500})
  }
  return d
}
function makeBook(side,mid,n=12){
  const rows=[];let tot=0
  for(let i=0;i<n;i++){
    const off=side==='ask'?(i+1)*mid*0.0003:-(i+1)*mid*0.0003
    const px=(mid+off).toFixed(mid<0.01?8:2)
    const sz=(Math.random()*60+2).toFixed(2)
    tot+=parseFloat(sz)
    rows.push({price:px,size:sz,total:tot.toFixed(2)})
  }
  return side==='bid'?rows.reverse():rows
}

/* ─────────────────────────── PairSelector ──────────────────────── */
function PairSelector({selected,onChange}){
  const [open,setOpen]=useState(false)
  return(
    <div className="relative">
      <button onClick={()=>setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161A1E]/70 border border-[#F0B90B]/10 hover:border-[#F0B90B]/30 transition-all">
        <span className="text-base font-bold text-white">{selected}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open?'rotate-180':''}`}/>
      </button>
      <AnimatePresence>
        {open&&(
          <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:4}}
            className="absolute top-full mt-1 left-0 z-30 w-44 glass-card rounded-xl overflow-hidden shadow-2xl">
            {PAIRS.map(p=>(
              <button key={p} onClick={()=>{onChange(p);setOpen(false)}}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#F0B90B]/5 transition-colors ${p===selected?'text-[#F0B90B] font-semibold':'text-gray-300'}`}>
                {p}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─────────────────────────── PriceChart ────────────────────────── */
function PriceChart({pair,liveData,entryPrice}){
  const [chartData,setChartData]=useState(()=>makeChartData(pair))
  const [hover,setHover]=useState(null)
  const [tf,setTf]=useState('1m')
  const [loadingChart,setLoadingChart]=useState(false)

  // Fetch real Binance historical candles when pair or timeframe changes
  useEffect(()=>{
    let cancelled=false
    const load=async()=>{
      setLoadingChart(true)
      const candles=await fetchHistoricalPrices(pair,tf,80)
      if(!cancelled){
        setChartData(candles.length>0 ? candles : makeChartData(pair))
        setLoadingChart(false)
      }
    }
    load()
    return()=>{ cancelled=true }
  },[pair,tf])

  // Append live price tick to chart tail
  useEffect(()=>{
    if(!liveData?.price||liveData.loading)return
    setChartData(prev=>{
      if(!prev.length)return prev
      const newPoint={
        time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),
        price:liveData.price,
        volume:prev[prev.length-1]?.volume??1000,
      }
      return[...prev.slice(-79),newPoint]
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[liveData?.price])

  const currentPrice=liveData?.price??parseFloat(SEED_PRICES[pair]??'100')
  const dp=hover??currentPrice
  const first=chartData[0]?.price??currentPrice
  const trend=currentPrice>=first?'#02C076':'#F6465D'
  const chg=liveData?.change24h!=null
    ?liveData.change24h.toFixed(2)
    :(((currentPrice-first)/first)*100).toFixed(2)
  const high24=liveData?.high24h>0?`$${fmt(liveData.high24h)}`:`$${fmt(currentPrice*1.023)}`
  const low24 =liveData?.low24h >0?`$${fmt(liveData.low24h)}` :`$${fmt(currentPrice*0.977)}`
  const vol24 =liveData?.volume24h>0
    ?liveData.volume24h>1e9?`$${(liveData.volume24h/1e9).toFixed(2)}B`:`$${(liveData.volume24h/1e6).toFixed(1)}M`
    :'—'

  return(
    <div className="flex-1 min-h-[340px] glass-card rounded-xl p-4 flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-white font-mono">${fmt(dp)}</div>
            {liveData?.source&&!liveData.loading&&(
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-semibold"
                style={{background:'rgba(2,192,118,0.1)',color:'#02C076',border:'1px solid rgba(2,192,118,0.2)'}}>
                <Wifi className="w-2.5 h-2.5"/> {liveData.source} Live
              </span>
            )}
            {liveData?.error&&(
              <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded"
                style={{background:'rgba(246,70,93,0.1)',color:'#F6465D'}}>
                <WifiOff className="w-2.5 h-2.5"/> Offline
              </span>
            )}
            {liveData?.loading&&(
              <span className="w-3 h-3 rounded-full border-2 animate-spin flex-shrink-0"
                style={{borderColor:'rgba(240,185,11,0.3)',borderTopColor:'#F0B90B'}}/>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-semibold ${parseFloat(chg)>=0?'text-[#02C076]':'text-[#F6465D]'}`}>
              {parseFloat(chg)>=0?'+':''}{chg}%
            </span>
            <span className="text-xs text-gray-500">24h · {tf}</span>
          </div>
        </div>
        <div className="flex gap-1">
          {['1m','5m','15m','1h','4h','1d'].map(t=>(
            <button key={t} onClick={()=>setTf(t)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${t===tf?'bg-[#F0B90B]/20 text-[#F0B90B]':'text-gray-600 hover:text-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-[240px] relative">
        {loadingChart&&(
          <div className="absolute inset-0 flex items-center justify-center z-10"
            style={{background:'rgba(22,26,30,0.5)'}}>
            <div className="flex flex-col items-center gap-2">
              <span className="w-5 h-5 rounded-full border-2 animate-spin"
                style={{borderColor:'rgba(240,185,11,0.3)',borderTopColor:'#F0B90B'}}/>
              <span className="text-[10px]" style={{color:'#848E9C'}}>Loading {pair} chart…</span>
            </div>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}
            onMouseMove={e=>e?.activePayload&&setHover(e.activePayload[0].value)}
            onMouseLeave={()=>setHover(null)}
            margin={{left:0,right:0,top:4,bottom:0}}>
            <defs>
              <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={trend} stopOpacity={0.18}/>
                <stop offset="95%" stopColor={trend} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
            <XAxis dataKey="time" tick={{fill:'#4b5563',fontSize:9}} tickLine={false} axisLine={false} interval={15}/>
            <YAxis tick={{fill:'#4b5563',fontSize:9}} tickLine={false} axisLine={false}
              domain={['auto','auto']} tickFormatter={v=>`$${fmt(v)}`} width={62}/>
            <RechartTooltip
              contentStyle={{background:'rgba(22,26,30,0.97)',border:'1px solid rgba(240,185,11,0.2)',borderRadius:10,fontSize:11}}
              labelStyle={{color:'#6b7280'}} itemStyle={{color:trend}}
              formatter={v=>[`$${fmt(v)}`,'Price']}/>
            {entryPrice&&(
              <ReferenceLine y={parseFloat(entryPrice)} stroke="#F0B90B"
                strokeDasharray="4 3" strokeWidth={1}
                label={{value:'Entry',fill:'#F0B90B',fontSize:9,position:'right'}}/>
            )}
            <Area type="monotone" dataKey="price" stroke={trend} strokeWidth={1.5}
              fill="url(#cg)" dot={false} activeDot={{r:3,fill:trend}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-5 mt-2 pt-2 border-t border-white/5">
        {[['24h High',high24],['24h Low',low24],['24h Vol',vol24],['Feed',liveData?.source??'Mock']].map(([l,v])=>(
          <div key={l}>
            <div className="text-[9px] text-gray-600">{l}</div>
            <div className="text-[11px] font-mono text-gray-300">{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderBookPanel({currentPrice,pair}){
  const [asks,setAsks]=useState(()=>makeBook('ask',parseFloat(currentPrice)))
  const [bids,setBids]=useState(()=>makeBook('bid',parseFloat(currentPrice)))
  // Use ref so interval is NOT recreated on every price tick
  const priceRef=useRef(currentPrice)
  priceRef.current=currentPrice
  useEffect(()=>{
    const id=setInterval(()=>{
      const m=parseFloat(priceRef.current)
      setAsks(makeBook('ask',m))
      setBids(makeBook('bid',m))
    },2000)
    return()=>clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  const mx=Math.max(...[...asks,...bids].map(e=>parseFloat(e.total)))
  return(
    <div className="w-full lg:w-[230px] glass-card rounded-xl overflow-hidden flex flex-col">
      <div className="px-3 py-2.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-gray-400"/><span className="text-xs font-semibold text-white">Order Book</span></div>
        <span className="text-[9px] text-gray-500">{pair}</span>
      </div>
      <div className="grid grid-cols-3 px-3 py-1.5 text-[9px] font-semibold text-gray-600 uppercase tracking-wider border-b border-white/3">
        <span>Price</span><span className="text-center">Size</span><span className="text-right">Total</span>
      </div>
      <div className="overflow-hidden">
        {asks.slice(0,8).map((e,i)=>(
          <div key={i} className="relative grid grid-cols-3 px-3 py-[3px] text-[10px] hover:bg-white/[0.02] cursor-pointer">
            <div className="absolute inset-y-0 right-0 bg-[#FF4D6D]/6" style={{width:`${(parseFloat(e.total)/mx)*100}%`}}/>
            <span className="text-[#FF4D6D] font-mono z-10">{e.price}</span>
            <span className="text-center text-gray-400 z-10">{e.size}</span>
            <span className="text-right text-gray-600 z-10">{e.total}</span>
          </div>
        ))}
      </div>
      <div className="px-3 py-1.5 border-y border-white/5 flex justify-between items-center bg-[#161A1E]/40">
        <span className="text-[9px] text-gray-500">Spread</span>
        <span className="text-[10px] font-mono font-semibold text-[#F0B90B]">${(parseFloat(currentPrice)*0.0003).toFixed(3)}</span>
      </div>
      <div className="overflow-hidden">
        {bids.slice(0,8).map((e,i)=>(
          <div key={i} className="relative grid grid-cols-3 px-3 py-[3px] text-[10px] hover:bg-white/[0.02] cursor-pointer">
            <div className="absolute inset-y-0 right-0 bg-[#00FFB2]/6" style={{width:`${(parseFloat(e.total)/mx)*100}%`}}/>
            <span className="text-[#00FFB2] font-mono z-10">{e.price}</span>
            <span className="text-center text-gray-400 z-10">{e.size}</span>
            <span className="text-right text-gray-600 z-10">{e.total}</span>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-white/5 text-center">
        <span className="text-[9px] text-gray-500">Mark: </span>
        <span className="text-[11px] font-mono font-bold text-white">${fmt(currentPrice)}</span>
      </div>
    </div>
  )
}

/* ─────────────────────────── OrderPanel ────────────────────────── */
function OrderPanel({currentPrice,pair,onTrade,balRefresh}){
  const {isPrivateMode,privacyScore}=useArciumPrivacy()
  const {toast}=useAppShell()
  const {isWrongNetwork}=useNetworkGuard()
  const {usdcBalance}=useSolanaBalance()
  const pipeline=useArciumPipeline()

  const [orderType,setOrderType]=useState('market')
  const [side,setSide]=useState('long')
  const [size,setSize]=useState('')
  const [limitPx,setLimitPx]=useState('')
  const [leverage,setLeverage]=useState(5)
  const [stopLoss,setStopLoss]=useState('')
  const [takeProfit,setTakeProfit]=useState('')
  const [lastExecHash,setLastExecHash]=useState(null)
  const [lastTxSig,setLastTxSig]=useState(null)
  const [showModal,setShowModal]=useState(false)
  const [tradeInfo,setTradeInfo]=useState(null)
  const {copied,copy}=useCopy()

  // Feature #13 — respond to L/S keyboard shortcuts
  useEffect(()=>{
    const handler=(e)=>setSide(e.detail)
    window.addEventListener('puffinperpdex:side',handler)
    return()=>window.removeEventListener('puffinperpdex:side',handler)
  },[])

  const ep        = orderType==='limit'&&limitPx ? parseFloat(limitPx) : parseFloat(currentPrice)
  const sz        = parseFloat(size)||0
  const avail     = usdcBalance??0
  const margin    = sz>0 ? (sz/leverage).toFixed(4) : '—'
  const ld        = 1/leverage*(side==='long'?0.95:1.05)
  const liqPx     = sz>0 ? (side==='long'?(ep*(1-ld)).toFixed(4):(ep*(1+ld)).toFixed(4)) : '—'
  const notionalUsd = sz>0 ? sz*ep : 0
  const exposureUsd = sz>0 ? sz*ep*leverage : 0
  // Feature #3 — fee estimate
  const feeAmt    = sz>0 ? (notionalUsd*(orderType==='market'?TAKER_FEE:MAKER_FEE)).toFixed(4) : '—'
  const feeUsd    = sz>0 ? (notionalUsd*leverage*(orderType==='market'?TAKER_FEE:MAKER_FEE)).toFixed(4) : '—'

  const slDefault = side==='long'?(ep*0.95).toFixed(2):(ep*1.05).toFixed(2)
  const tpDefault = side==='long'?(ep*1.10).toFixed(2):(ep*0.90).toFixed(2)
  // Leverage warning (feature #8)
  const highLev   = leverage>=10

  const canTrade=sz>0&&!pipeline.isRunning&&!isWrongNetwork

  // Feature #1 — quick fraction sizing from USDC balance
  const setFraction=useCallback((frac)=>{
    if(!avail||!ep)return
    setSize(((avail*frac)/ep).toFixed(4))
  },[avail,ep])

  const handleSubmit=useCallback(async()=>{
    if(!canTrade)return
    const execHash=isPrivateMode?makeArciumHash():null
    const params={side,size,leverage,entryPrice:ep.toString(),pair,orderType,
      stopLoss:stopLoss||null,takeProfit:takeProfit||null,isPrivate:isPrivateMode,arciumExecHash:execHash}
    // Show modal immediately before pipeline starts
    setTradeInfo({ action:'Opening', side, size, pair })
    setShowModal(true)
    try{
      const result=await pipeline.run(params)
      await onTrade({...params,liquidationPrice:liqPx,margin,arciumResult:result})
      if(balRefresh?.bump) balRefresh.bump()
      if(isPrivateMode&&execHash){setLastExecHash(execHash);setLastTxSig(result?.txSignature??null)}
      toast.success(`${side.toUpperCase()} ${size} ${pair} opened${isPrivateMode?' 🔒':''}`)
      setSize('');setLimitPx('');setStopLoss('');setTakeProfit('')
    }catch(e){
      toast.error(`Trade failed: ${e.message??'Unknown error'}`)
    }
  },[canTrade,side,size,leverage,ep,pair,orderType,stopLoss,takeProfit,isPrivateMode,liqPx,margin,pipeline,onTrade,toast,balRefresh])

  const handleModalClose=useCallback(()=>{
    setShowModal(false)
    pipeline.reset()
  },[pipeline])

  return(
    <div className="w-full lg:w-[310px] glass-card rounded-xl flex flex-col overflow-hidden">
      {/* Privacy header */}
      <div className={`flex items-center gap-2 px-4 py-2 text-[10px] font-semibold border-b ${isPrivateMode?'bg-[#F0B90B]/5 border-[#F0B90B]/10 text-[#F0B90B]':'bg-white/3 border-white/5 text-gray-500'}`}>
        {isPrivateMode?<EyeOff className="w-3 h-3"/>:<Eye className="w-3 h-3"/>}
        {isPrivateMode?`🔒 Arcium Private — Score ${privacyScore}%`:'Transparent Mode'}
        {/* Feature #12 — "What is Arcium?" tooltip */}
        <div className="ml-auto relative group cursor-help">
          <HelpCircle className="w-3 h-3 text-gray-600 group-hover:text-[#F0B90B] transition-colors"/>
          <div className="absolute right-0 top-5 z-50 w-56 p-2.5 rounded-lg bg-[#161A1E] border border-[#F0B90B]/20 text-[10px] text-gray-300 leading-relaxed shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <p className="font-semibold text-[#F0B90B] mb-1">What is Arcium?</p>
            Arcium uses <strong>multi-party computation (MPC)</strong> to run math on encrypted inputs — so your position sizes and PnL stay private even while being computed on-chain.
            <br/><a href="/privacy-architecture" className="text-[#F0B90B] mt-1 inline-block hover:underline">Learn more →</a>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-4 flex flex-col gap-3 flex-1 overflow-y-auto scrollbar-thin">
        {/* Order type */}
        <div className="grid grid-cols-2 gap-1 bg-[#161A1E]/60 p-1 rounded-lg">
          {['market','limit'].map(t=>(
            <button key={t} onClick={()=>setOrderType(t)} className={`py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${orderType===t?'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/25':'text-gray-500 hover:text-white'}`}>{t}</button>
          ))}
        </div>

        {/* Long / Short */}
        <div className="grid grid-cols-2 gap-1.5">
          {['long','short'].map(s=>(
            <button key={s} onClick={()=>setSide(s)} className={`py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              side===s
                ?s==='long'?'bg-[#00FFB2]/20 text-[#00FFB2] border border-[#00FFB2]/40 shadow-[0_0_12px_rgba(0,255,178,0.15)]'
                           :'bg-[#FF4D6D]/20 text-[#FF4D6D] border border-[#FF4D6D]/40 shadow-[0_0_12px_rgba(255,77,109,0.15)]'
                :'bg-white/3 border border-white/8 text-gray-500 hover:text-white'
            }`}>
              {s==='long'?<TrendingUp className="w-3.5 h-3.5"/>:<TrendingDown className="w-3.5 h-3.5"/>}
              {/* Feature #13 — keyboard shortcut hint */}
              {s.toUpperCase()} <span className="text-[8px] opacity-40 font-normal">[{s==='long'?'L':'S'}]</span>
            </button>
          ))}
        </div>

        {/* Limit price */}
        <AnimatePresence>
          {orderType==='limit'&&(
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}>
              <label className="text-[10px] text-gray-500 mb-1 block">Limit Price (USD)</label>
              <Input type="number" placeholder={fmt(currentPrice)} value={limitPx} onChange={e=>setLimitPx(e.target.value)}
                className="bg-[#161A1E]/60 border-[#F0B90B]/20 text-white placeholder:text-gray-700 focus:border-[#F0B90B]/50 font-mono"/>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Size with quick-fraction buttons */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-gray-500">Size ({pair.split('-')[0]})</label>
            <span className="text-[9px] text-gray-600 font-mono">Bal: <span className="text-[#F0B90B]">${avail.toLocaleString()}</span></span>
          </div>
          <div className="grid grid-cols-4 gap-1 mb-1.5">
            {[0.25,0.50,0.75,1.00].map(frac=>(
              <button key={frac} onClick={()=>setFraction(frac)} disabled={!avail||!ep}
                className="py-1 rounded-md text-[10px] font-semibold text-gray-500 bg-white/4 border border-white/8 hover:text-[#F0B90B] hover:border-[#F0B90B]/30 hover:bg-[#F0B90B]/5 transition-all disabled:opacity-30">
                {frac*100}%
              </button>
            ))}
          </div>
          <Input type="number" placeholder="0.0000" value={size} onChange={e=>setSize(e.target.value)}
            className="bg-[#161A1E]/60 border-[#F0B90B]/10 text-white placeholder:text-gray-700 focus:border-[#F0B90B]/40 font-mono"/>
        </div>

        {/* Leverage with high-leverage warning */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-gray-500">Leverage</label>
            <span className={`text-sm font-bold font-mono ${highLev?'text-yellow-400':'text-[#F0B90B]'}`}>{leverage}×</span>
          </div>
          <Slider min={1} max={20} step={1} value={[leverage]} onValueChange={([v])=>setLeverage(v)}
            className={`${highLev?'[&_[role=slider]]:bg-yellow-400 [&_[role=slider]]:border-yellow-400':'[&_[role=slider]]:bg-[#F0B90B] [&_[role=slider]]:border-[#F0B90B]'}`}/>
          <div className="flex justify-between mt-1.5">
            {[1,2,5,10,20].map(v=>(
              <button key={v} onClick={()=>setLeverage(v)} className={`text-[9px] px-1.5 py-0.5 rounded font-mono transition-colors ${leverage===v?'text-[#F0B90B] bg-[#F0B90B]/10':'text-gray-600 hover:text-gray-300'}`}>{v}×</button>
            ))}
          </div>
          {/* Feature #8 — high leverage warning */}
          <AnimatePresence>
            {highLev&&(
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                className="mt-2 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-yellow-400/5 border border-yellow-400/15 text-[9px] text-yellow-400">
                <AlertTriangle className="w-3 h-3 flex-shrink-0"/>
                High leverage — liquidation risk increases significantly
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary — feature #3 fee estimate + notional */}
        <div className="rounded-lg bg-[#161A1E]/50 border border-white/5 p-3 space-y-1.5 text-[11px]">
          {/* Feature #6 — Mark vs Index price */}
          <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div><span className="text-[9px] text-gray-600 block">Mark</span><span className="font-mono text-[#F0B90B] font-semibold">${fmt(ep)}</span></div>
              <div><span className="text-[9px] text-gray-600 block">Index</span><span className="font-mono text-gray-400">${fmt(parseFloat(ep)*0.9998)}</span></div>
            </div>
            <div className="text-right"><span className="text-[9px] text-gray-600 block">Basis</span><span className="font-mono text-[10px] text-gray-400">+0.02%</span></div>
          </div>
          {[
            ['Notional', sz>0?`$${notionalUsd.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—', false],
            ['Position Size', sz>0?`$${exposureUsd.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`:'—', false, '#F0B90B'],
            ['Margin Req.', margin!=='—'?`${margin} ${pair.split('-')[0]}`:'—', false],
            ['Est. Fee', feeAmt!=='—'?`$${feeUsd} (${(orderType==='market'?TAKER_FEE:MAKER_FEE)*100}%)`:'—', false, '#9ca3af'],
            ['Liq. Price', liqPx!=='—'?`$${liqPx}`:'—', true],
          ].map(([l,v,warn,col])=>(
            <div key={l} className="flex justify-between items-center">
              <span className="text-gray-500">{l}</span>
              <span className={`font-mono font-medium ${warn?'text-[#FF4D6D]':col?'':'text-white'}`} style={col&&!warn?{color:col}:{}}>{v}</span>
            </div>
          ))}
        </div>

        {/* SL / TP — always visible */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF4D6D]"/>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Risk Management</span>
          </div>
          <div>
            <label className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-[10px] text-gray-500"><StopCircle className="w-3 h-3 text-[#FF4D6D]"/>Stop Loss</span>
              {stopLoss&&ep&&<span className="text-[9px] font-mono text-[#FF4D6D]">-{(Math.abs((parseFloat(stopLoss)-ep)/ep)*100).toFixed(1)}%</span>}
            </label>
            <div className="relative">
              <Input type="number" placeholder={slDefault} value={stopLoss} onChange={e=>setStopLoss(e.target.value)}
                className="bg-[#161A1E]/60 border-[#FF4D6D]/15 text-white placeholder:text-gray-700 focus:border-[#FF4D6D]/40 font-mono pr-14"/>
              {!stopLoss&&<button onClick={()=>setStopLoss(slDefault)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#FF4D6D]/60 hover:text-[#FF4D6D] transition-colors font-medium">AUTO</button>}
            </div>
          </div>
          <div>
            <label className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-[10px] text-gray-500"><Target className="w-3 h-3 text-[#00FFB2]"/>Take Profit</span>
              {takeProfit&&ep&&<span className="text-[9px] font-mono text-[#00FFB2]">+{(Math.abs((parseFloat(takeProfit)-ep)/ep)*100).toFixed(1)}%</span>}
            </label>
            <div className="relative">
              <Input type="number" placeholder={tpDefault} value={takeProfit} onChange={e=>setTakeProfit(e.target.value)}
                className="bg-[#161A1E]/60 border-[#00FFB2]/15 text-white placeholder:text-gray-700 focus:border-[#00FFB2]/40 font-mono pr-14"/>
              {!takeProfit&&<button onClick={()=>setTakeProfit(tpDefault)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#00FFB2]/60 hover:text-[#00FFB2] transition-colors font-medium">AUTO</button>}
            </div>
          </div>
        </div>

        {isWrongNetwork&&(
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-yellow-400/5 border border-yellow-400/20">
            <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5"/>
            <p className="text-[10px] text-yellow-300">Switch to Solana Devnet to trade</p>
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!canTrade}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            !canTrade?'bg-white/5 text-gray-600 cursor-not-allowed':
            side==='long'?'bg-[#00FFB2]/20 text-[#00FFB2] border border-[#00FFB2]/40 hover:bg-[#00FFB2]/30 hover:shadow-[0_0_20px_rgba(0,255,178,0.2)]':
            'bg-[#FF4D6D]/20 text-[#FF4D6D] border border-[#FF4D6D]/40 hover:bg-[#FF4D6D]/30 hover:shadow-[0_0_20px_rgba(255,77,109,0.2)]'
          }`}>
          {pipeline.isRunning?(
            <><span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"/>Processing…</>
          ):(
            <>{side==='long'?<TrendingUp className="w-4 h-4"/>:<TrendingDown className="w-4 h-4"/>}
              {orderType==='limit'?'Place Limit':'Open'} {side.charAt(0).toUpperCase()+side.slice(1)}
              {isPrivateMode&&<Lock className="w-3.5 h-3.5 opacity-60"/>}
            </>
          )}
        </button>

        <AnimatePresence>
          {pipeline.step>0&&!showModal&&(
            <ArciumPipelineTracker step={pipeline.step} error={pipeline.error} result={pipeline.result}/>
          )}
        </AnimatePresence>
      </div>

      {/* Full-screen Arcium modal */}
      <ArciumPipelineModal
        step={showModal ? pipeline.step : 0}
        error={pipeline.error}
        result={pipeline.result}
        tradeInfo={tradeInfo}
        onClose={handleModalClose}
      />
    </div>
  )
}

/* ─────────────────────── PositionsPanel ────────────────────────── */
function PositionsPanel({positions,onClose,currentPrice}){
  const {toast}=useAppShell()
  const [closingId,setClosingId]=useState(null)
  const closePipeline=useArciumPipeline()
  const [showCloseModal,setShowCloseModal]=useState(false)
  const [closeTradeInfo,setCloseTradeInfo]=useState(null)

  const doClose=async(pos)=>{
    setClosingId(pos.id)
    const diff=parseFloat(currentPrice)-parseFloat(pos.entryPrice)
    const pnl=(diff*parseFloat(pos.size)*(pos.side==='long'?1:-1)).toFixed(4)
    // Show Arcium modal for close too
    setCloseTradeInfo({ action:'Closing', side:pos.side, size:pos.size, pair:pos.pair })
    setShowCloseModal(true)
    try{
      await closePipeline.run({ side:pos.side, size:pos.size, pair:pos.pair, entryPrice:pos.entryPrice, leverage:pos.leverage, isPrivate:pos.isPrivate })
      await onClose({id:pos.id,exitPrice:currentPrice,pnl})
      toast.success(`Closed — PnL: ${parseFloat(pnl)>=0?'+':''}${pnl}`)
    }catch{
      toast.error('Failed to close position')
    }finally{
      setClosingId(null)
    }
  }

  if(!positions.length)return(
    <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-2 min-h-[100px]">
      <Layers className="w-6 h-6 text-gray-700"/><p className="text-xs text-gray-600">No open positions</p>
    </div>
  )

  return(
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-gray-400"/>
        <span className="text-sm font-semibold text-white">Open Positions</span>
        <span className="ml-auto text-[10px] bg-[#F0B90B]/10 text-[#F0B90B] px-2 py-0.5 rounded-full">{positions.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead><tr className="border-b border-white/5 text-gray-500">
            {/* Feature #7 — added ROE% column */}
            {['Pair','Side','Size','Entry','Liq.','Margin','Unr. PnL','ROE %',''].map(h=>(
              <th key={h} className="px-3 py-2 font-medium text-left">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-white/3">
            {positions.map(pos=>{
              const diff=parseFloat(currentPrice)-parseFloat(pos.entryPrice)
              const pnl=(diff*parseFloat(pos.size)*(pos.side==='long'?1:-1))
              const pnlStr=pnl.toFixed(4)
              const marginNum=parseFloat(pos.margin)||1
              // Feature #7 — ROE = PnL / margin
              const roe=((pnl/marginNum)*100).toFixed(2)
              const win=pnl>=0
              // Feature #2 — PnL % of notional
              const notional=parseFloat(pos.entryPrice)*parseFloat(pos.size)
              const pnlPct=notional>0?((pnl/notional)*100).toFixed(2):0

              return(
                <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-white">{pos.pair}</span>
                      {pos.isPrivate&&<EyeOff className="w-3 h-3 text-[#F0B90B]"/>}
                    </div>
                    <div className="text-[9px] text-gray-600">{pos.leverage}× · {pos.orderType??'market'}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className={`text-[10px] ${pos.side==='long'?'border-[#00FFB2]/30 text-[#00FFB2]':'border-[#FF4D6D]/30 text-[#FF4D6D]'}`}>
                      {pos.side.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-gray-300">{pos.size}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-300">${fmt(pos.entryPrice)}</td>
                  <td className="px-3 py-2.5 font-mono text-[#FF4D6D]">${fmt(pos.liquidationPrice)}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-400">{pos.margin}</td>
                  {/* Feature #2 — PnL with % */}
                  <td className="px-3 py-2.5 font-mono font-semibold">
                    <span className={win?'text-[#00FFB2]':'text-[#FF4D6D]'}>{win?'+':''}{pnlStr}</span>
                    <div className={`text-[9px] font-normal ${win?'text-[#00FFB2]/60':'text-[#FF4D6D]/60'}`}>{win?'+':''}{pnlPct}%</div>
                  </td>
                  {/* Feature #7 — ROE */}
                  <td className="px-3 py-2.5 font-mono font-semibold">
                    <span className={win?'text-[#00FFB2]':'text-[#FF4D6D]'}>{win?'+':''}{roe}%</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={()=>doClose(pos)} disabled={closingId===pos.id}
                      className="px-2 py-1 rounded-md text-[10px] font-medium border border-[#FF4D6D]/30 text-[#FF4D6D] hover:bg-[#FF4D6D]/10 transition-colors disabled:opacity-40">
                      {closingId===pos.id?'…':'Close'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Arcium pipeline modal for close trades */}
      <ArciumPipelineModal
        step={showCloseModal ? closePipeline.step : 0}
        error={closePipeline.error}
        result={closePipeline.result}
        tradeInfo={closeTradeInfo}
        onClose={()=>{ setShowCloseModal(false); closePipeline.reset() }}
      />
    </div>
  )
}

/* ─────────────────────── HistoryPanel ──────────────────────────── */
function HistoryPanel({history}){
  if(!history.length)return(
    <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-2 min-h-[100px]">
      <History className="w-6 h-6 text-gray-700"/><p className="text-xs text-gray-600">No trade history yet</p>
    </div>
  )
  return(
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
        <History className="w-3.5 h-3.5 text-gray-400"/><span className="text-sm font-semibold text-white">Trade History</span>
      </div>
      <div className="max-h-[220px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-[11px]">
          <thead><tr className="border-b border-white/5 text-gray-500 sticky top-0 bg-[#161A1E]">
            {['Pair','Side','Size','Entry','Exit','PnL','ROE','Time'].map(h=><th key={h} className="px-3 py-2 font-medium text-left">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-white/3">
            {history.map((t,i)=>{
              const pn=parseFloat(t.pnl??0)
              const marginN=parseFloat(t.margin)||1
              const roe=((pn/marginN)*100).toFixed(1)
              return(
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="px-3 py-2 text-gray-300">{t.pair??'SOL-PERP'}</td>
                  <td className={`px-3 py-2 font-medium ${t.side==='long'?'text-[#00FFB2]':'text-[#FF4D6D]'}`}>{t.side?.toUpperCase()}</td>
                  <td className="px-3 py-2 font-mono text-gray-400">{t.size}</td>
                  <td className="px-3 py-2 font-mono text-gray-400">${fmt(t.entryPrice)}</td>
                  <td className="px-3 py-2 font-mono text-gray-400">${fmt(t.exitPrice)}</td>
                  <td className={`px-3 py-2 font-mono font-semibold ${pn>=0?'text-[#00FFB2]':'text-[#FF4D6D]'}`}>{pn>=0?'+':''}{pn.toFixed(4)}</td>
                  <td className={`px-3 py-2 font-mono text-[10px] ${pn>=0?'text-[#00FFB2]/70':'text-[#FF4D6D]/70'}`}>{pn>=0?'+':''}{roe}%</td>
                  <td className="px-3 py-2 text-gray-600">{new Date(t.closedAt??t.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─────────────────────────── MAIN PAGE ─────────────────────────── */
export default function Trade(){
  const {publicKey,connected}=useWallet()
  const {isWrongNetwork}=useNetworkGuard()
  const {isPrivateMode}=useArciumPrivacy()
  const fundingRate=useFundingRate()

  const [pair,setPair]=useState('SOL-PERP')
  const [entryRef,setEntryRef]=useState(null)
  const [balTick,setBalTick]=useState(0)
  const balRef=useRef({current:0})
  balRef.current={current:balTick, bump:()=>setBalTick(t=>t+1)}
  const walletKey=publicKey?.toString()??'demo'

  // Real-time price feed — Binance primary, CoinGecko fallback
  const liveData = useRealtimePrice(pair)
  const price    = liveData.price > 0 ? String(liveData.price) : (SEED_PRICES[pair] ?? '100')

  // Features #1 + #11 — localStorage persistence + demo positions
  const {positions,history,openPosition,closePosition,setPositions,setHistory}=useMockTrades()
  const [hydrated,setHydrated]=useState(false)

  useEffect(()=>{
    if(hydrated)return
    const saved=walletKey!=='demo'?loadPersistedState(walletKey):null
    if(saved){
      setPositions(saved.positions)
      setHistory(saved.history)
    } else {
      // First visit — seed demo data (feature #11)
      setPositions(makeDemoPositions())
      setHistory(makeDemoHistory())
    }
    setHydrated(true)
  },[walletKey]) // eslint-disable-line

  // Persist on every change
  useEffect(()=>{
    if(!hydrated||walletKey==='demo')return
    persistState(walletKey,positions,history)
  },[positions,history,walletKey,hydrated])

  // Feature #10 — animated price flash
  const priceFlash=usePriceFlash(price)

  const handleTrade=useCallback(async(params)=>{
    const pos=await openPosition({...params,entryPrice:params.entryPrice})
    setEntryRef(params.entryPrice)
    return pos
  },[openPosition])

  const handleClose=useCallback(async(args)=>{
    await closePosition(args)
    balRef.current.bump()
  },[closePosition])

  // Feature #13 — L/S keyboard shortcuts to switch long/short in OrderPanel
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'l' || e.key === 'L') window.dispatchEvent(new CustomEvent('puffinperpdex:side', { detail: 'long' }))
      if (e.key === 's' || e.key === 'S') window.dispatchEvent(new CustomEvent('puffinperpdex:side', { detail: 'short' }))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if(!connected) return(
    <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center px-4">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass-card rounded-2xl p-10 text-center max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl btn-gradient flex items-center justify-center mx-auto mb-6 glow-cyan">
          <Zap className="w-8 h-8 text-[#161A1E]"/>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">Connect a Solana wallet to start trading. Make sure you're on <span className="text-[#F0B90B] font-semibold">Devnet</span>.</p>
        <WalletMultiButton/>
        <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-1 text-xs text-[#F0B90B] hover:underline">Get free Devnet SOL →</a>
      </motion.div>
    </div>
  )

  return(
    <div className="min-h-screen bg-[#0B0E11] py-3 px-3 sm:px-4">
      <div className="max-w-[1700px] mx-auto space-y-3">

        {/* ── Top bar ── */}
        <div className="flex flex-wrap items-center gap-3">
          <PairSelector selected={pair} onChange={setPair}/>

          {/* Feature #10 — price with flash animation */}
          <div className="flex items-baseline gap-2">
            <motion.span
              key={price}
              animate={{color: priceFlash==='up'?'#00FFB2':priceFlash==='down'?'#FF4D6D':'#ffffff'}}
              transition={{duration:0.3}}
              className="text-xl font-bold font-mono"
            >
              ${fmt(price)}
            </motion.span>
              {(() => { const c=liveData.change24h??0; const pos=c>=0; return <span className='text-xs font-semibold' style={{color:pos?'#02C076':'#F6465D'}}>{pos?'+':''}{Math.abs(c).toFixed(2)}%</span> })()}
          </div>

          {/* Feature #6 — Index price */}
          <div className="hidden md:flex items-center gap-1 text-[10px]">
            <span className="text-gray-600">Index:</span>
            <span className="font-mono text-gray-400">${fmt(parseFloat(price)*0.9998)}</span>
          </div>

          {/* Feature #1 — Funding rate */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161A1E]/60 border border-white/8 text-[10px]">
            <span className="text-gray-500">Funding 8h:</span>
            <span className={`font-mono font-semibold ${fundingRate>=0?'text-[#00FFB2]':'text-[#FF4D6D]'}`}>
              {fundingRate>=0?'+':''}{(fundingRate*100).toFixed(4)}%
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161A1E]/70 border border-white/8 text-xs text-gray-400 font-mono">
              {shortAddr(walletKey)}
            </div>
            <WalletBalanceDisplay refreshTrigger={balTick} variant="panel"/>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold ${isPrivateMode?'bg-[#F0B90B]/8 border-[#F0B90B]/20 text-[#F0B90B]':'bg-white/3 border-white/8 text-gray-500'}`}>
              {isPrivateMode?<Shield className="w-3 h-3"/>:<Eye className="w-3 h-3"/>}
              {isPrivateMode?'PRIVATE':'PUBLIC'}
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#00FFB2]/8 border border-[#00FFB2]/20">
              <Radio className="w-2.5 h-2.5 text-[#00FFB2] animate-pulse"/>
              <span className="text-[9px] font-bold text-[#00FFB2] tracking-wider">DEVNET</span>
            </div>
          </div>
        </div>

        {/* Wrong network banner */}
        <AnimatePresence>
          {isWrongNetwork&&(
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0"/>
              <p className="text-sm text-yellow-300 font-medium">Wrong network — switch wallet to <strong>Solana Devnet</strong> to trade.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trading grid */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
            <PriceChart pair={pair} liveData={liveData} entryPrice={entryRef}/>
            <OrderBookPanel currentPrice={price} pair={pair}/>
          </div>
          <OrderPanel currentPrice={price} pair={pair} onTrade={handleTrade} balRefresh={balRef.current}/>
        </div>

        {/* Bottom panels */}
        <Tabs defaultValue="positions">
          <TabsList className="bg-[#161A1E]/60 border border-white/8 mb-3">
            <TabsTrigger value="positions" className="data-[state=active]:bg-[#F0B90B]/15 data-[state=active]:text-[#F0B90B] text-xs">
              Positions ({positions.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#F0B90B]/15 data-[state=active]:text-[#F0B90B] text-xs">
              History ({history.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="positions">
            <PositionsPanel positions={positions} onClose={handleClose} currentPrice={price}/>
          </TabsContent>
          <TabsContent value="history">
            <HistoryPanel history={history}/>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  )
}
