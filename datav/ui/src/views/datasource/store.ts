import { atom } from 'nanostores'
import { Datasource } from 'types/datasource'


type DatasourceList = Datasource[]
type Datasources = Record<number, DatasourceList>

export const $teamDatasources = atom<Datasources>(null)
export const $datasources = atom<Datasource[]>([])