import { atom } from 'nanostores'
import { Team } from 'types/teams'



// store:
// 1. global variables of current team
// 2. current dashboard variables
export const $teams = atom<Team[]>([])