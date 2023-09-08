import { atom } from 'nanostores'
import { Datasource } from 'types/datasource'


export const $datasources = atom<Datasource[]>([])
     