import { Team } from "./teams"

export interface Tenant {
    id: number
    name: string
    ownerId: number
    owner: string
    isPublic: boolean
    numTeams: number
    teams: Team[]
    created: string
}