import { NavLink, Outlet } from 'react-router-dom'

export const LOGO_URL =
  'https://cdn.prod.website-files.com/6928d334b7a7a6941baf0636/69a1cad46ea550499086146b_logo-isotipo-large.png'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-5 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-red-700 text-white shadow-sm' : 'border border-neutral-300 bg-white text-neutral-800 hover:border-red-300 hover:text-red-700',
  ].join(' ')

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b-4 border-red-700 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-3">
          <img src={LOGO_URL} alt="Logo del banco" className="h-16 w-auto object-contain" />
          <div className="border-l border-neutral-200 pl-3">
            <p className="text-lg font-semibold leading-tight text-red-800">Banco Atlántida</p>
            <p className="text-xs text-neutral-500">Cuentas y transferencias</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <nav className="mb-6 flex gap-3">
          <NavLink to="/" end className={navClass}>
            Cuentas
          </NavLink>
          <NavLink to="/transferencias" className={navClass}>
            Nueva transferencia
          </NavLink>
        </nav>
        <Outlet />
      </main>
    </div>
  )
}
