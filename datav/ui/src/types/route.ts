// Copyright 2023 xObserve.io Team

import { Role } from './role'

export interface Route {
  id?: number
  url: string
  icon?: any
  title: string
  disabled?: boolean
  minRole?: Role
  children?: Route[]
}
