import { createContext } from 'react'
import type { Account } from '../types/api'

export interface AccountsState {
  accounts: Account[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

export const AccountsContext = createContext<AccountsState | null>(null)
