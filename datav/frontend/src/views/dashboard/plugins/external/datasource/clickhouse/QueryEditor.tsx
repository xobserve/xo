// Copyright 2023 xObserve.io Team

import {
  Box,
  HStack,
  Input,
  VStack,
  useMediaQuery,
  Select,
} from '@chakra-ui/react'
import { cloneDeep } from 'lodash'
import { useState } from 'react'
import { PanelQuery } from 'types/dashboard'
import React from 'react'
import { DatasourceEditorProps } from 'types/datasource'
import FormItem from 'src/components/form/Item'
import { Form } from 'src/components/form/Form'
import { commonMsg, prometheusDsMsg } from 'src/i18n/locales/en'
import { useStore } from '@nanostores/react'
import CodeEditor, { LogqlLang } from 'src/components/CodeEditor/CodeEditor'
import { IsSmallScreen } from 'src/data/constants'
import { $datasources } from 'src/views/datasource/store'
import { DataFormat } from 'types/format'
import { locale } from 'src/i18n/i18n'
import ExpandTimeline from '../../../components/query-edtitor/ExpandTimeline'
import SelectDataFormat from '../../../components/query-edtitor/SelectDataFormat'

const QueryEditor = ({
  datasource,
  query,
  onChange,
}: DatasourceEditorProps) => {
  const t1 = useStore(prometheusDsMsg)
  const t = useStore(commonMsg)
  let lang = useStore(locale)
  const [tempQuery, setTempQuery] = useState<PanelQuery>(cloneDeep(query))
  const [isSmallScreen] = useMediaQuery(IsSmallScreen)
  const isLargeScreen = !isSmallScreen
  const Stack = isLargeScreen ? HStack : VStack
  if (tempQuery.data['expandTimeline'] == undefined) {
    tempQuery.data['expandTimeline'] = 'auto'
  }

  const ds = $datasources.get().find((d) => d.id == datasource.id)

  return (
    <Form spacing={1}>
      <FormItem size='sm' title={t.query}>
        <Stack width='100%' alignItems={isLargeScreen ? 'center' : 'end'}>
          <Box
            width={isLargeScreen ? 'calc(100% - 100px)' : 'calc(100% - 5px)'}
          >
            <CodeEditor
              language='sql'
              value={tempQuery.metrics}
              onChange={(v) => {
                setTempQuery({ ...tempQuery, metrics: v })
              }}
              onBlur={() => {
                onChange(tempQuery)
              }}
              isSingleLine
              placeholder='enter clickhouse query'
            />
          </Box>
        </Stack>
      </FormItem>
      <Stack
        alignItems={isLargeScreen ? 'center' : 'start'}
        spacing={isLargeScreen ? 4 : 1}
      >
        <FormItem labelWidth={'100px'} size='sm' title='Legend'>
          <Input
            value={tempQuery.legend}
            onChange={(e) => {
              setTempQuery({ ...tempQuery, legend: e.currentTarget.value })
            }}
            onBlur={() => onChange(tempQuery)}
            width='100px'
            placeholder={t1.legendFormat}
            size='sm'
          />
        </FormItem>
        <SelectDataFormat
          tempQuery={tempQuery}
          setTempQuery={setTempQuery}
          onChange={onChange}
        />
      </Stack>
      {/* <ExpandTimeline t1={t1} tempQuery={tempQuery} setTempQuery={setTempQuery} onChange={onChange}/> */}
    </Form>
  )
}

export default QueryEditor
