// Copyright 2023 xObserve.io Team

import { atom } from 'nanostores'
import { TimeRange } from 'types/time'

export const $time = atom<TimeRange>(null)
