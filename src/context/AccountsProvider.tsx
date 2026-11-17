import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { accountsApi } from '../api/bank'
import { ApiError } from '../api/http'
import type { Account } from '../types/api'
import { AccountsContext } from './accountsContext'

const LOAD_ERROR = 'No se pudieron cargar las cuentas.'

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await accountsApi.list()
      setAccounts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : LOAD_ERROR)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    accountsApi
      .list()
      .then((data) => active && setAccounts(data))
      .catch((err: unknown) => active && setError(err instanceof ApiError ? err.message : LOAD_ERROR))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    await fetchAccounts()
  }, [fetchAccounts])

  const value = useMemo(() => ({ accounts, loading, error, reload }), [accounts, loading, error, reload])
  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>
}
