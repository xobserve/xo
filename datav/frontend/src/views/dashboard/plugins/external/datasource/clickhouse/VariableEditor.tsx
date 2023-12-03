// Copyright 2023 xObserve.io Team

import { Button, Select, Switch, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Variable } from 'types/variable'
import { isJSON } from 'utils/is'
import { queryVariableValues } from './query_runner'
import { EditorInputItem } from 'src/components/editor/EditorItem'
import { DatasourceVariableEditorProps } from 'types/datasource'
import FormItem from 'src/components/form/Item'
import React from 'react'
import { useStore } from '@nanostores/react'
import { cfgVariablemsg } from 'src/i18n/locales/en'
import { getCurrentTimeRange } from 'components/DatePicker/TimePicker'
import { dateTimeFormat } from 'utils/datetime/formatter'

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

  useEffect(() => {
    loadVariables(variable)
  }, [variable])

  const loadVariables = async (v: Variable) => {
    const result = await queryVariableValues(v)
    onQueryResult(result)
  }

  const timeRange = getCurrentTimeRange()
  return <></>
}

export default VariableEditor
