import { atom } from 'nanostores'
import { TimeRange } from 'types/time';

export const $time = atom<TimeRange>(null)