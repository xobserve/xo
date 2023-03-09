import { Role } from "./role"

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

export interface SideMenu {
    id: number
    teamId : number
    isPublic?: boolean
    teamName? : string
    desc? : string
    data: MenuItem[]
}

export interface MenuItem {
    url: string
    title: string
    icon?: string
    children?: MenuItem[]
    expanded?: boolean
}