import { useContext } from 'react'
import { AccountsContext, type AccountsState } from './accountsContext'

export function useAccounts(): AccountsState {
  const context = useContext(AccountsContext)
  if (!context) {
    throw new Error('useAccounts debe usarse dentro de <AccountsProvider>')
  }
  return context
}
