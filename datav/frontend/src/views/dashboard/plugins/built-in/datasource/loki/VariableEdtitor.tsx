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

import { Switch } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Variable } from 'types/variable'
import { isJSON } from 'utils/is'
import { EditorInputItem } from 'src/components/editor/EditorItem'
import { DatasourceVariableEditorProps } from 'types/datasource'
import FormItem from 'src/components/form/Item'
import React from 'react'
import { useStore } from '@nanostores/react'
import { cfgVariablemsg } from 'src/i18n/locales/en'
import { queryLokiLabelNames, queryLokiVariableValues } from './query_runner'
import { getNewestTimeRange } from 'src/components/DatePicker/TimePicker'
import { Select } from 'antd'
import InputSelect from 'src/components/select/InputSelect'

export enum LokiDsQueryTypes {
  LabelValues = 'Label values',
  LabelNames = 'Label names',
  Series = 'Series',
}

const LokiVariableEditor = ({
  variable,
  onChange,
  onQueryResult,
}: DatasourceVariableEditorProps) => {
  const t1 = useStore(cfgVariablemsg)
  const [labelNames, setLabelNames] = useState<string[]>([])
  let data
  if (!isJSON(variable.value)) {
    data = {
      type: LokiDsQueryTypes.Series,
    }
    onChange((variable) => {
      variable.value = JSON.stringify(data)
    })
  } else {
    data = JSON.parse(variable.value)
  }

  if (data.useCurrentTime == undefined) {
    data.useCurrentTime = true
  }

  useEffect(() => {
    loadVariables(variable)
  }, [variable])

  useEffect(() => {
    loadLabelNames()
  }, [data.useCurrentTime])

  const loadLabelNames = async () => {
    const timeRange = getNewestTimeRange()
    const res = await queryLokiLabelNames(
      variable.datasource,
      data.useCurrentTime ? timeRange : null,
    )
    setLabelNames(res.data)
  }

  const loadVariables = async (v: Variable) => {
    const result = await queryLokiVariableValues(v)
    onQueryResult(result)
  }

  return (
    <>
      <FormItem title={t1.useCurrentTime} alignItems='center'>
        <Switch
          size='md'
          defaultChecked={data.useCurrentTime}
          onChange={(e) => {
            data.useCurrentTime = e.target.checked
            onChange((variable) => {
              variable.value = JSON.stringify(data)
            })
          }}
        />
      </FormItem>
      <FormItem title={t1.queryType}>
        <Select
          size='large'
          value={data.type}
          onChange={(v) => {
            data.type = v
            onChange((variable) => {
              variable.value = JSON.stringify(data)
            })
          }}
          popupMatchSelectWidth={false}
        >
          {Object.keys(LokiDsQueryTypes).map((k) => (
            <option value={LokiDsQueryTypes[k]}>{LokiDsQueryTypes[k]}</option>
          ))}
        </Select>
      </FormItem>
      {data.type == LokiDsQueryTypes.Series && (
        <FormItem
          title='Series selector'
          desc={` 'Optional. If defined, a list of values for the specified log series selector is returned. For example: {label="value"}, you can also select multi series, split with space: {label="value1"} {label="value2"}'`}
        >
          <EditorInputItem
            value={data.seriesSelector}
            onChange={(v) => {
              data.seriesSelector = v
              onChange((variable) => {
                variable.value = JSON.stringify(data)
              })
            }}
            placeholder='optional series selector'
          />
        </FormItem>
      )}
      {data.type == LokiDsQueryTypes.LabelValues && (
        <FormItem title='Select label'>
          <InputSelect
            width='260px'
            isClearable
            value={data.labelName}
            placeholder={'input to search, support variables'}
            size='md'
            options={labelNames.map((m) => {
              return { label: m, value: m }
            })}
            onChange={(v) => {
              data.labelName = v
              onChange((variable) => {
                variable.value = JSON.stringify(data)
              })
            }}
            enableInput
          />
        </FormItem>
      )}
    </>
  )
}

export default LokiVariableEditor
