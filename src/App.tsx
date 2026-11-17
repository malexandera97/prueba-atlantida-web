import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import AccountHistoryPage from './pages/AccountHistoryPage'
import AccountsPage from './pages/AccountsPage'
import TransferPage from './pages/TransferPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AccountsPage />} />
        <Route path="/transferencias" element={<TransferPage />} />
        <Route path="/cuentas/:id" element={<AccountHistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
