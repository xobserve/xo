import { PermissionMode } from './misc'

export interface AccessToken {
  id: number
  token: string
  name: string
  scope: number
  scopeId: string
  description: string
  mode: PermissionMode
  createdBy: number
  created: string
  expired: number
}
