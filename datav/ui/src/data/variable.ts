// Copyright 2023 xObserve.io Team

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

export const builtinVariables = [
  VariableInterval,
  VariableTimerangeFrom,
  VariableTimerangeTo,
]
