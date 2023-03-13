import { Role } from "./role"

export const globalTeamId = 1

export interface Team {
    id : number 
    name: string
    brief?: string
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
    teamId : number
    isPublic?: boolean
    teamName? : string
    brief? : string
    data: MenuItem[]
}

export interface MenuItem {
    url: string
    title: string
    dashboardId: string
    icon?: string
    children?: MenuItem[]
    expanded?: boolean
}