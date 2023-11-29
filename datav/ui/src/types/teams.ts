// Copyright 2023 xObserve.io Team

import { AvailableStatus } from './misc'
import { Role } from './role'

export interface Team {
  id: number
  name: string
  isPublic?: boolean
  brief?: string
  createdBy?: string
  createdById?: number
  memberCount?: number
  status?: AvailableStatus
  role?: Role
  syncUsers?: boolean
}

export interface TeamMember {
  id: number
  teamId?: number
  username: string
  created: string
  role: Role
}

export interface SideMenu {
  teamId: number
  isPublic?: boolean
  teamName?: string
  brief?: string
  data: MenuItem[]
}

export interface MenuItem {
  url: string
  title: string
  dashboardId: string
  icon?: string
  children?: MenuItem[]
}
