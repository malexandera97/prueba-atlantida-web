# prueba-atlantida-web

Frontend de Banco Atlántida para ver cuentas, registrar transferencias y consultar el historial. Consume únicamente la API local `prueba-atlantida-api`.

**Stack:** React 19 · TypeScript · Vite · React Router · Tailwind CSS.

## Requisitos

- Node.js 22.12 o superior y npm
- `prueba-atlantida-api` corriendo en `http://localhost:8080` (base de datos y backend: ver su README)

## Levantar el frontend

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173`.

La URL del backend se configura con `VITE_API_URL` (ver `.env.example`); por defecto `http://localhost:8080`.

| Comando | Uso |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run build` | build de producción en `dist/` |
| `npm run lint` | análisis estático |

## Pantallas

| Ruta | Pantalla |
|---|---|
| `/` | Lista de cuentas (ID, titular, saldo) |
| `/transferencias` | Formulario de transferencia, resultado exitoso con saldos anterior y nuevo, y transferencia rechazada con el mensaje de la API |
| `/cuentas/:id` | Historial de transferencias de la cuenta |

## Decisiones técnicas

- Un único cliente HTTP (`src/api/http.ts`) que muestra el mensaje de error devuelto por la API.
- Estado de cuentas compartido con contexto: después de una transferencia los saldos se actualizan sin recargar la página.
- Cada transferencia envía `Idempotency-Key`; si falla la red, el reintento usa la misma clave.
- El monto se escribe con separador de miles automático (`5,000.00`).
- Antes de enviar la transferencia, un modal pide confirmar el monto, la cuenta origen y el destinatario.
- Tailwind CSS con el rojo como color principal.
