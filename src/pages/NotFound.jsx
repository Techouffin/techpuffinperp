import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Zap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050714] flex items-center justify-center px-4">
      <div className="glass-card rounded-2xl p-10 text-center max-w-sm w-full">
        <div className="w-14 h-14 rounded-2xl btn-gradient flex items-center justify-center mx-auto mb-6 glow-cyan">
          <Zap className="w-7 h-7 text-[#0A0F2C]" />
        </div>
        <h1 className="text-6xl font-bold text-[#00F5FF] neon-text mb-2">404</h1>
        <p className="text-gray-400 mb-6">Page not found</p>
        <Button asChild className="w-full btn-gradient text-[#0A0F2C] font-semibold rounded-xl hover:opacity-90">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
