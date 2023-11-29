// Copyright 2023 xObserve.io Team

import { atom } from 'nanostores'
import { Datasource } from 'types/datasource'

export const $datasources = atom<Datasource[]>([])
