import type { Account, TransferHistoryItem, TransferRequest, TransferResponse } from '../types/api'
import { http } from './http'

export const accountsApi = {
  list: () => http.get<Account[]>('/api/accounts'),
  get: (id: number) => http.get<Account>(`/api/accounts/${id}`),
  history: (id: number) => http.get<TransferHistoryItem[]>(`/api/accounts/${id}/transfers`),
}

export const transfersApi = {
  create: (transfer: TransferRequest, idempotencyKey: string) =>
    http.post<TransferResponse>('/api/transfers', transfer, { 'Idempotency-Key': idempotencyKey }),
}
