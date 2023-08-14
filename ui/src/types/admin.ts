import { User } from "./user"

export interface AuditLog {
    id: number
    opId: string
    opType: string
    created: string
    data: any
    targetId: string
    op: User
}