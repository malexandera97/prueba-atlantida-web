import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { accountsApi } from '../api/bank'
import { ApiError } from '../api/http'
import { Alert, Button, Card, Loading, PageTitle, tableClass, tdClass, thClass } from '../components/ui'
import type { Account, TransferHistoryItem } from '../types/api'
import { formatDateTime, formatHnl } from '../utils/format'

export default function AccountHistoryPage() {
  const { id } = useParams()
  const accountId = Number(id)

  const [account, setAccount] = useState<Account | null>(null)
  const [history, setHistory] = useState<TransferHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [detail, items] = await Promise.all([accountsApi.get(accountId), accountsApi.history(accountId)])
      setAccount(detail)
      setHistory(items)
      setError(null)
    } catch (err) {
      setAccount(null)
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el historial.')
    } finally {
      setLoading(false)
    }
  }, [accountId])

  useEffect(() => {
    let active = true
    Promise.all([accountsApi.get(accountId), accountsApi.history(accountId)])
      .then(([detail, items]) => {
        if (!active) return
        setAccount(detail)
        setHistory(items)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!active) return
        setAccount(null)
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar el historial.')
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [accountId])

  const load = useCallback(async () => {
    setLoading(true)
    await fetchData()
  }, [fetchData])

  return (
    <section>
      <PageTitle title={`Historial de la cuenta ${id}`} subtitle="Transferencias enviadas y recibidas, de la más reciente a la más antigua" />

      {error && <Alert kind="error" title="No se pudo cargar la cuenta">{error}</Alert>}
      {loading && !account && <Loading />}

      {account && (
        <>
          <Card className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">Titular</p>
              <p className="text-lg font-semibold">{account.holderName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-500">Saldo actual</p>
              <p className="text-lg font-semibold tabular-nums text-red-800">{formatHnl(account.balance)}</p>
            </div>
          </Card>

          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>No.</th>
                <th className={thClass}>Fecha</th>
                <th className={thClass}>Tipo</th>
                <th className={thClass}>Contraparte</th>
                <th className={`${thClass} text-right`}>Monto</th>
                <th className={`${thClass} text-right`}>Saldo resultante</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => {
                const sent = item.direction === 'ENVIADA'
                return (
                  <tr key={item.transferId}>
                    <td className={tdClass}>{item.transferId}</td>
                    <td className={tdClass}>{formatDateTime(item.createdAt)}</td>
                    <td className={tdClass}>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          sent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {sent ? 'Enviada' : 'Recibida'}
                      </span>
                    </td>
                    <td className={tdClass}>
                      {item.counterpartAccountId} – {item.counterpartHolderName}
                    </td>
                    <td className={`${tdClass} text-right tabular-nums ${sent ? 'text-red-700' : 'text-green-700'}`}>
                      {sent ? '−' : '+'} {formatHnl(item.amount)}
                    </td>
                    <td className={`${tdClass} text-right tabular-nums`}>{formatHnl(item.balanceAfter)}</td>
                  </tr>
                )
              })}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className={`${tdClass} text-center text-neutral-500`}>
                    Esta cuenta todavía no tiene transferencias.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      <div className="mt-5 flex gap-3">
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          Actualizar
        </Button>
        <Link to="/" className="self-center text-sm font-medium text-red-700 hover:underline">
          Volver a cuentas
        </Link>
      </div>
    </section>
  )
}
