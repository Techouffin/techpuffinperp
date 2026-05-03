import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { SolanaWalletProvider } from './providers/solana-wallet'
import { ArciumPrivacyProvider } from './providers/arcium-privacy'
import { AppShellProvider } from './providers/app-shell'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SolanaWalletProvider>
        <ArciumPrivacyProvider>
          <AppShellProvider>
            <App />
          </AppShellProvider>
        </ArciumPrivacyProvider>
      </SolanaWalletProvider>
    </BrowserRouter>
  </StrictMode>,
)
