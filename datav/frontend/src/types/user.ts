// Copyright 2023 xObserve.io Team

import { AvailableStatus } from './misc'
import { Role } from './role'

export interface Session {
  token: string
  createTime: string
  user: User
}

export interface User {
  id: number
  username: string
  avatar: string
  name: string
  role: Role
  email: string
  created: string
  password?: string
  visits?: number
  data?: Record<string, any>
  currentTenant?: number
  currentTeam?: number
  lastSeenAt?: string
  status?: AvailableStatus
}
