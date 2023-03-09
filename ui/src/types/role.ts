export enum Role {
    Viewer = "Viewer",
    ADMIN = "Admin",
    SUPER_ADMIN = "SuperAdmin"
}

export const SuperAdminId = 1

export function isAdmin(role) {
    return role === Role.ADMIN || role === Role.SUPER_ADMIN
}