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

import { setDateTime } from 'src/components/DatePicker/DatePicker'
import { setVariable } from 'src/views/variables/SelectVariable'
import { $variables } from 'src/views/variables/store'
import { navigateTo } from 'utils/url'

// limitations under the License.
export const genDynamicFunction = (ast) => {
  try {
    const f = eval('(' + ast + ')')
    return f
  } catch (error) {
    return error
  }
}

export const commonInteractionEvent = (callback, data, navigate?) => {
  return callback(
    data,
    (url) => navigateTo(url, navigate),
    (k, v) => setVariable(k, v),
    setDateTime,
    $variables,
  )
}
