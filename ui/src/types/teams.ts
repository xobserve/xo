import { Role } from "./acl";

export interface Team {
    id : number 
    name: string
    createdBy?: string
    createdById?: number
    memberCount?: number
}

export interface TeamMember {
    id: number 
    teamId?: number
    username: string 
    created: string 
    role: Role 
}