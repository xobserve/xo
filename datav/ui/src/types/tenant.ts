// Copyright 2023 xObserve.io Team

import { AvailableStatus } from './misc'
import { Team } from './teams'

export interface Tenant {
  id: number
  name: string
  ownerId: number
  owner: string
  isPublic: boolean
  numTeams: number
  teams: Team[]
  status: AvailableStatus
  created: string
}
