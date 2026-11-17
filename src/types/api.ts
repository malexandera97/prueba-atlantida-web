export interface Account {
  id: number
  holderName: string
  balance: number
}

export interface TransferRequest {
  sourceAccountId: number
  destinationAccountId: number
  amount: number
}

export interface AccountMovement {
  accountId: number
  holderName: string
  previousBalance: number
  newBalance: number
}

export interface TransferResponse {
  id: number
  amount: number
  createdAt: string
  source: AccountMovement
  destination: AccountMovement
}

export type TransferDirection = 'ENVIADA' | 'RECIBIDA'

export interface TransferHistoryItem {
  transferId: number
  direction: TransferDirection
  counterpartAccountId: number
  counterpartHolderName: string
  amount: number
  balanceAfter: number
  createdAt: string
}

export interface FieldError {
  field: string
  message: string
}

export interface ApiErrorBody {
  timestamp?: string
  status?: number
  error?: string
  message?: string
  path?: string
  errors?: FieldError[]
}
