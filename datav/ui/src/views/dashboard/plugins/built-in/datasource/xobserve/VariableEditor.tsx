// Copyright 2023 xObserve.io Team

import { isEmpty } from 'lodash'
import { DatasourceVariableEditorProps } from 'types/datasource'
import { isJSON } from 'utils/is'
import { useEffect } from 'react'
import { queryxobserveVariableValues } from './query_runner'
import FormItem from 'src/components/form/Item'
import React from 'react'
import { useStore } from '@nanostores/react'
import { httpDsMsg } from 'src/i18n/locales/en'
import { Select } from 'antd'
import { apiList } from './QueryEditor'
import { Box } from '@chakra-ui/react'
import CodeEditor from 'components/CodeEditor/CodeEditor'
import { DataFormat } from 'types/format'

const VariableEditor = ({
  variable,
  onChange,
  onQueryResult,
}: DatasourceVariableEditorProps) => {
  const t1 = useStore(httpDsMsg)
  const data = isJSON(variable.value) ? JSON.parse(variable.value) : {}

  let update
  if (isEmpty(data.params)) {
    data.params = '{}'
    update = true
  }
  if (update)
    onChange((variable) => {
      variable.value = JSON.stringify(data)
    })

  useEffect(() => {
    loadVariables(variable)
  }, [variable])

  const loadVariables = async (v) => {
    const result = await queryxobserveVariableValues(variable)
    onQueryResult(result)
  }

  return (
    <>
      <FormItem title='API' labelWidth='100px' size='sm'>
        <Select
          style={{ minWidth: '150px' }}
          popupMatchSelectWidth={false}
          value={data.url}
          options={apiList
            .filter((api) => api.format == DataFormat.ValueList)
            .map((api) => ({ label: api.name, value: api.name }))}
          onChange={(v) => {
            data.url = v
            onChange((variable) => {
              variable.value = JSON.stringify(data)
            })
          }}
        />
      </FormItem>
      <FormItem title='Params' labelWidth='100px' size='sm'>
        <Box width='300px'>
          <CodeEditor
            language='json'
            value={data.params}
            height='200px'
            onChange={(v) => {
              data.params = v
            }}
            onBlur={() => {
              onChange((variable) => {
                variable.value = JSON.stringify(data)
              })
            }}
            isSingleLine
          />
        </Box>
      </FormItem>
    </>
  )
}

export default VariableEditor
