// Copyright 2023 xobserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
