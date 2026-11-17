import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
    </div>
  )
}

type Variant = 'primary' | 'secondary'

export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles =
    variant === 'primary'
      ? 'bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-700 disabled:bg-red-300'
      : 'border border-neutral-300 bg-white text-neutral-800 hover:border-red-300 hover:text-red-700 disabled:opacity-50'
  return (
    <button
      className={`rounded-md px-5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-neutral-200 bg-white p-6 shadow-sm ${className}`}>{children}</div>
}

export function Alert({ kind, title, children }: { kind: 'success' | 'error'; title: string; children?: ReactNode }) {
  const styles = kind === 'success' ? 'border-green-600 bg-green-50 text-green-800' : 'border-red-600 bg-red-50 text-red-800'
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-lg border px-4 py-3 ${styles}`}>
      <p className="font-semibold">
        {kind === 'success' ? '✓' : '✕'} {title}
      </p>
      {children && <div className="mt-1 text-sm">{children}</div>}
    </div>
  )
}

export function Loading({ text = 'Cargando…' }: { text?: string }) {
  return <p className="py-6 text-sm text-neutral-500">{text}</p>
}

export const tableClass = 'w-full overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm shadow-sm'
export const thClass = 'bg-neutral-100 px-4 py-3 text-left font-semibold text-neutral-700'
export const tdClass = 'border-t border-neutral-200 px-4 py-3 whitespace-nowrap'
