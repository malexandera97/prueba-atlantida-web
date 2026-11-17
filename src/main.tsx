import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AccountsProvider } from './context/AccountsProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AccountsProvider>
        <App />
      </AccountsProvider>
    </BrowserRouter>
  </StrictMode>,
)
