// Copyright 2023 xObserve.io Team

import { find, orderBy } from 'lodash'
import { Dashboard } from 'types/dashboard'
import { Variable } from 'types/variable'

export const catelogVariables = (vars: Variable[], dashboard: Dashboard) => {
  const dvars = orderBy(
    vars.filter((v) => v.id.toString().startsWith('d-')),
    ['sortWeight', 'name'],
    ['desc', 'asc'],
  )
  const gvars = orderBy(
    vars.filter(
      (v) =>
        !v.id.toString().startsWith('d-') &&
        !find(dashboard?.data.hidingVars?.split(','), (v1) =>
          v.name.toLowerCase().match(v1),
        ),
    ),
    ['sortWeight', 'name'],
    ['desc', 'asc'],
  )

  return [dvars, gvars]
}
