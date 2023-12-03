import { atom } from 'nanostores'
import { Annotation } from 'types/annotation';

export const $dashAnnotations = atom<Annotation[]>([])
export const $rawDashAnnotations = atom<Annotation[]>([])