// Copyright 2023 xObserve.io Team

export enum Role {
  Viewer = 'Viewer',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'SuperAdmin',
}

export const SuperAdminId = 1

export function isAdmin(role) {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN
}

export function isSuperAdmin(role) {
  return role === Role.SUPER_ADMIN
}
