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

import { Variable, VariableQueryType, VariableRefresh } from 'types/variable'

export const initVariable: Variable = {
  name: '',
  type: VariableQueryType.Custom,
  value: '',
  regex: '',
  refresh: VariableRefresh.OnDashboardLoad,
  enableMulti: false,
  enableAll: false,
}

export const VariableSplitChar = '+'
export const VarialbeAllOption = '__all__'

export const VariableCurrentValue = '__current__' // refer to the current value of current object, e.g row data of Table panel

export const VariableInterval = '__interval__' // refer to the caculated interval of current panel, e.g used for prometheus 'step' parameter
export const VariableTimerangeFrom = '__from__' // refer to the 'from' value in current time range
export const VariableTimerangeTo = '__to__' // refer to the 'to' value in current time range
export const VariableRange = '__range__' // refer to the 'range' value in current time range, e.g the range of [now-5m, now] is 5m

export const builtinVariables = [
  VariableInterval,
  VariableTimerangeFrom,
  VariableTimerangeTo,
]
