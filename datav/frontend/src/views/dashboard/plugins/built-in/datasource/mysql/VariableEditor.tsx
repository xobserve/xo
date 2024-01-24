import { DatasourceVariableEditorProps } from 'types/datasource'
import { cfgVariablemsg } from 'src/i18n/locales/en'
import { useStore } from '@nanostores/react'
import { isJSON } from 'utils/is'
import React, { useEffect } from 'react'
import { Variable } from 'types/variable'
import { queryVariableValues } from './query_runner'
import { getCurrentTimeRange } from 'components/DatePicker/TimePicker'
import useLoadVars from 'src/views/variables/useLoadVars'

export enum PromDsQueryTypes {
  LabelValues = 'Label values',
  LabelNames = 'Label names',
  Metrics = 'Metrics',
}

const VariableEditor = ({
  variable,
  onChange,
  onQueryResult,
}: DatasourceVariableEditorProps) => {
  const t1 = useStore(cfgVariablemsg)
  const data = isJSON(variable.value)
    ? JSON.parse(variable.value)
    : {
        type: PromDsQueryTypes.LabelValues,
      }

  if (data.useCurrentTime == undefined) {
    data.useCurrentTime = true
  }

  const loadVariables = async (v: Variable) => {
    const result = await queryVariableValues(v)
    onQueryResult(result)
  }

  useLoadVars(variable, loadVariables)

  const timeRange = getCurrentTimeRange()
  return <></>
}

export default VariableEditor
