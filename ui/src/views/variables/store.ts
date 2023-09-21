import { atom } from 'nanostores'
import { Variable } from 'types/variable';


type VariableList = Variable[]
type Variables = Record<number, VariableList>

// store all team's global variables
export const $teamVariables = atom<Variables>(null)

// store:
// 1. global variables of current team
// 2. current dashboard variables
export const $variables = atom<Variable[]>([])