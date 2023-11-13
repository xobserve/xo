import { atom } from 'nanostores'
import { Variable } from 'types/variable';

// store:
// 1. global variables of current team
// 2. current dashboard variables
export const $variables = atom<Variable[]>([])