// Copyright 2023 xObserve.io Team

import { Input, VStack } from '@chakra-ui/react'
import FormItem from 'src/components/form/Item'
import { cloneDeep } from 'lodash'
import { PanelQuery } from 'types/dashboard'
import { DatasourceEditorProps } from 'types/datasource'
import { useImmer } from 'use-immer'
import React from 'react'
import { useStore } from '@nanostores/react'
import { jaegerDsMsg } from 'src/i18n/locales/en'
import { PanelTypeNodeGraph } from '../../panel/nodeGraph/types'
import { PanelTypeTable } from '../../panel/table/types'

const JaegerQueryEditor = ({
  panel,
  query,
  onChange,
}: DatasourceEditorProps) => {
  const t1 = useStore(jaegerDsMsg)
  const [tempQuery, setTempQuery] = useImmer<PanelQuery>(cloneDeep(query))

  switch (panel.type) {
    case PanelTypeNodeGraph:
    case PanelTypeTable:
      return (
        <VStack alignItems='left' spacing='1'>
          <FormItem
            labelWidth='200px'
            title={t1.showServices}
            desc={t1.showServicesTips}
          >
            <Input
              value={tempQuery.metrics}
              onChange={(e) => {
                const v = e.target.value
                setTempQuery((q) => {
                  q.metrics = v
                })
              }}
              onBlur={() => {
                onChange(tempQuery)
              }}
              placeholder='e.g mysql,redis'
            />
          </FormItem>
        </VStack>
      )

    default:
      return <VStack alignItems='left' spacing='1'></VStack>
  }
}

export default JaegerQueryEditor
