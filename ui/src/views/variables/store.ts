import { atom } from 'nanostores'
import { Variable } from 'types/variable';

export const $variables = atom<Variable[]>([])
