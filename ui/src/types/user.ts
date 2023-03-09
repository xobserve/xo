import { Role } from "./role"

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
}
