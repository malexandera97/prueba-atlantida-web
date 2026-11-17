import { Link } from 'react-router-dom'
import { Alert, Button, Loading, PageTitle, tableClass, tdClass, thClass } from '../components/ui'
import { useAccounts } from '../context/useAccounts'
import { formatHnl } from '../utils/format'

export default function AccountsPage() {
  const { accounts, loading, error, reload } = useAccounts()

  return (
    <section>
      <PageTitle title="Banco Atlántida – Cuentas" subtitle="Lista de cuentas con su titular y saldo actual" />

      {error && <Alert kind="error" title="No se pudieron cargar las cuentas">{error}</Alert>}

      {loading && accounts.length === 0 ? (
        <Loading />
      ) : (
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>ID</th>
              <th className={thClass}>Titular</th>
              <th className={`${thClass} text-right`}>Saldo (HNL)</th>
              <th className={`${thClass} text-right`}>Historial</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-red-50/40">
                <td className={`${tdClass} font-medium`}>{account.id}</td>
                <td className={tdClass}>{account.holderName}</td>
                <td className={`${tdClass} text-right tabular-nums`}>{formatHnl(account.balance)}</td>
                <td className={`${tdClass} text-right`}>
                  <Link to={`/cuentas/${account.id}`} className="font-medium text-red-700 hover:underline">
                    Ver historial
                  </Link>
                </td>
              </tr>
            ))}
            {!loading && accounts.length === 0 && !error && (
              <tr>
                <td colSpan={4} className={`${tdClass} text-center text-neutral-500`}>
                  No hay cuentas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <Button variant="secondary" className="mt-5" onClick={() => void reload()} disabled={loading}>
        {loading ? 'Actualizando…' : 'Actualizar'}
      </Button>
    </section>
  )
}
