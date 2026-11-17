import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { transfersApi } from '../api/bank'
import { ApiError } from '../api/http'
import ConfirmDialog from '../components/ConfirmDialog'
import { Alert, Button, Card, Loading, PageTitle, tableClass, tdClass, thClass } from '../components/ui'
import { useAccounts } from '../context/useAccounts'
import type { TransferResponse } from '../types/api'
import { formatAmountFixed, formatAmountInput, formatHnl, newIdempotencyKey, unformatAmount } from '../utils/format'

interface FormState {
  sourceAccountId: string
  destinationAccountId: string
  amount: string
}

const EMPTY_FORM: FormState = { sourceAccountId: '', destinationAccountId: '', amount: '' }

const fieldClass = (hasError: boolean) =>
  `mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
    hasError ? 'border-red-600 focus:ring-red-200' : 'border-neutral-300 focus:border-red-600 focus:ring-red-100'
  }`

export default function TransferPage() {
  const { accounts, loading, reload } = useAccounts()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [rejection, setRejection] = useState<string | null>(null)
  const [result, setResult] = useState<TransferResponse | null>(null)
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const idempotencyKey = useRef<string>(newIdempotencyKey())
  const amountInput = useRef<HTMLInputElement>(null)

  const sourceAccountId = form.sourceAccountId || (accounts[0] ? String(accounts[0].id) : '')
  const destinationAccountId = form.destinationAccountId || (accounts[1] ? String(accounts[1].id) : '')
  const sourceAccount = accounts.find((a) => String(a.id) === sourceAccountId)
  const destinationAccount = accounts.find((a) => String(a.id) === destinationAccountId)
  const amountValue = Number(unformatAmount(form.amount))

  function update(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setFieldErrors((errors) => ({ ...errors, [field]: '' }))
  }

  function changeAmount(event: ChangeEvent<HTMLInputElement>) {
    const { value, selectionStart } = event.target
    const significantBeforeCaret = value.slice(0, selectionStart ?? value.length).replace(/[^\d.]/g, '').length
    const formatted = formatAmountInput(value)
    update('amount', formatted)
    requestAnimationFrame(() => {
      const input = amountInput.current
      if (!input) return
      let position = 0
      let significant = 0
      while (position < formatted.length && significant < significantBeforeCaret) {
        if (/[\d.]/.test(formatted[position])) significant++
        position++
      }
      input.setSelectionRange(position, position)
    })
  }

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {}
    if (!sourceAccountId) errors.sourceAccountId = 'Seleccione la cuenta origen'
    if (!destinationAccountId) errors.destinationAccountId = 'Seleccione la cuenta destino'
    if (sourceAccountId && sourceAccountId === destinationAccountId) {
      errors.destinationAccountId = 'La cuenta destino debe ser diferente de la cuenta origen'
    }
    const plainAmount = unformatAmount(form.amount)
    const amount = Number(plainAmount)
    if (!plainAmount || Number.isNaN(amount) || amount <= 0) errors.amount = 'Ingrese un monto mayor que cero'
    else if (!/^\d+(\.\d{0,2})?$/.test(plainAmount)) errors.amount = 'El monto admite como máximo 2 decimales'
    return errors
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    setRejection(null)
    const errors = validate()
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return
    update('amount', formatAmountFixed(form.amount))
    setConfirming(true)
  }

  async function confirmTransfer() {
    setSending(true)
    try {
      const transfer = await transfersApi.create(
        {
          sourceAccountId: Number(sourceAccountId),
          destinationAccountId: Number(destinationAccountId),
          amount: amountValue,
        },
        idempotencyKey.current,
      )
      idempotencyKey.current = newIdempotencyKey()
      setResult(transfer)
      await reload()
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(0, { message: String(err) })
      if (!apiError.isNetworkError) {
        idempotencyKey.current = newIdempotencyKey()
      }
      setRejection(apiError.message)
      setFieldErrors(apiError.byField())
      await reload()
    } finally {
      setSending(false)
      setConfirming(false)
    }
  }

  function newTransfer() {
    setResult(null)
    setRejection(null)
    setFieldErrors({})
    setForm((f) => ({ ...f, amount: '' }))
  }

  if (result) {
    return (
      <section>
        <PageTitle title="Nueva transferencia" subtitle="Resultado de la transferencia" />
        <Alert kind="success" title="Transferencia realizada">
          Transferencia No. {result.id} · {formatHnl(result.amount)} de {result.source.accountId} a {result.destination.accountId}
        </Alert>

        <table className={`${tableClass} max-w-2xl`}>
          <thead>
            <tr>
              <th className={thClass}>Cuenta</th>
              <th className={`${thClass} text-right`}>Saldo anterior</th>
              <th className={`${thClass} text-right`}>Saldo nuevo</th>
            </tr>
          </thead>
          <tbody>
            {[result.source, result.destination].map((movement) => (
              <tr key={movement.accountId}>
                <td className={tdClass}>
                  {movement.accountId} – {movement.holderName}
                </td>
                <td className={`${tdClass} text-right tabular-nums`}>{formatHnl(movement.previousBalance)}</td>
                <td className={`${tdClass} text-right font-semibold tabular-nums`}>{formatHnl(movement.newBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={newTransfer}>
            Nueva transferencia
          </Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            Ver cuentas
          </Button>
          <Link to={`/cuentas/${result.source.accountId}`} className="self-center text-sm font-medium text-red-700 hover:underline">
            Ver historial de la cuenta {result.source.accountId}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section>
      <PageTitle title="Nueva transferencia" subtitle="Transferencia entre cuentas del mismo banco" />

      {rejection && (
        <div className="max-w-xl">
          <Alert kind="error" title="Transferencia rechazada">
            {rejection}
          </Alert>
        </div>
      )}

      {loading && accounts.length === 0 ? (
        <Loading text="Cargando cuentas…" />
      ) : (
        <Card className="max-w-xl">
          <form onSubmit={submit} noValidate className="space-y-5">
            <label className="block text-sm text-neutral-700">
              Cuenta origen
              <select
                className={fieldClass(Boolean(fieldErrors.sourceAccountId))}
                value={sourceAccountId}
                onChange={(e) => update('sourceAccountId', e.target.value)}
              >
                <option value="">Seleccione…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} – {a.holderName} ({formatHnl(a.balance)})
                  </option>
                ))}
              </select>
              {fieldErrors.sourceAccountId && <span className="mt-1 block text-xs text-red-700">{fieldErrors.sourceAccountId}</span>}
            </label>

            <label className="block text-sm text-neutral-700">
              Cuenta destino
              <select
                className={fieldClass(Boolean(fieldErrors.destinationAccountId))}
                value={destinationAccountId}
                onChange={(e) => update('destinationAccountId', e.target.value)}
              >
                <option value="">Seleccione…</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} – {a.holderName} ({formatHnl(a.balance)})
                  </option>
                ))}
              </select>
              {fieldErrors.destinationAccountId && (
                <span className="mt-1 block text-xs text-red-700">{fieldErrors.destinationAccountId}</span>
              )}
            </label>

            <label className="block text-sm text-neutral-700">
              Monto (HNL)
              <input
                ref={amountInput}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                className={fieldClass(Boolean(fieldErrors.amount) || Boolean(rejection))}
                value={form.amount}
                onChange={changeAmount}
                onBlur={() => update('amount', formatAmountFixed(form.amount))}
              />
              {fieldErrors.amount && <span className="mt-1 block text-xs text-red-700">{fieldErrors.amount}</span>}
            </label>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={sending}>
                {sending ? 'Procesando…' : 'Transferir'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/')} disabled={sending}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <ConfirmDialog
        open={confirming}
        title="Confirmar transferencia"
        confirmText="Confirmar transferencia"
        busy={sending}
        onConfirm={() => void confirmTransfer()}
        onCancel={() => setConfirming(false)}
      >
        <p>
          ¿Está seguro de que desea transferir <strong className="text-red-800">{formatHnl(amountValue)}</strong> a{' '}
          <strong>{destinationAccount?.holderName}</strong>?
        </p>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg bg-neutral-50 p-4">
          <dt className="text-neutral-500">Desde</dt>
          <dd className="font-medium">
            {sourceAccount?.id} – {sourceAccount?.holderName}
          </dd>
          <dt className="text-neutral-500">Hacia</dt>
          <dd className="font-medium">
            {destinationAccount?.id} – {destinationAccount?.holderName}
          </dd>
          <dt className="text-neutral-500">Monto</dt>
          <dd className="font-semibold tabular-nums">{formatHnl(amountValue)}</dd>
        </dl>
      </ConfirmDialog>
    </section>
  )
}
