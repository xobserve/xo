// Copyright 2023 xObserve.io Team

import { setDateTime } from 'src/components/DatePicker/DatePicker'
import { gnavigate } from 'layouts/PageContainer'
import { setVariable } from 'src/views/variables/SelectVariable'
import { $variables } from 'src/views/variables/store'

// limitations under the License.
export const genDynamicFunction = (ast) => {
  try {
    const f = eval('(' + ast + ')')
    return f
  } catch (error) {
    return error
  }
}

export const commonInteractionEvent = (callback, data) => {
  return callback(
    data,
    gnavigate,
    (k, v) => setVariable(k, v),
    setDateTime,
    $variables,
  )
}
