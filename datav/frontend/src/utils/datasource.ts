// Copyright (c) 2017 Uber Technologies, Inc.
//

import { hasVariableFormat, replaceWithVariables } from './variable'
import { Datasource } from 'types/datasource'
import { floor } from 'lodash'
import { $datasources } from 'src/views/datasource/store'

export const getDatasource = (k, ds?): Datasource => {
  const datasources = ds ?? $datasources.get()
  let currentDatasource
  if (hasVariableFormat(k?.toString())) {
    const name = replaceWithVariables(k,{})
    currentDatasource = datasources?.find((ds) => ds.name == name)
  } else {
    currentDatasource = datasources?.find((ds) => ds.id == k)
  }
  return currentDatasource
}

export const roundDsTime = (timestamp) => {
  return floor(timestamp)
}
