import { Role } from "./acl";

export interface Team {
    id : string 
    name: string
    createdBy?: string
    createdById?: string
    memberCount?: number
}

export interface TeamMember {
    id: string 
    teamId?: string
    username: string 
    created: string 
    role: Role 
}