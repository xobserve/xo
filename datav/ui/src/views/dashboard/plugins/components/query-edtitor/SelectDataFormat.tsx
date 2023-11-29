// Copyright 2023 xObserve.io Team

import { Select } from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import FormItem from 'components/form/Item'
import { cloneDeep } from 'lodash'
import React, { Dispatch } from 'react'
import { locale } from 'src/i18n/i18n'
import { PanelQuery } from 'types/dashboard'
import { DataFormat } from 'types/format'

const SelectDataFormat = ({
  tempQuery,
  setTempQuery,
  onChange,
  labelWidth = '150px',
  spacing,
}: {
  tempQuery: PanelQuery
  setTempQuery: Dispatch<React.SetStateAction<PanelQuery>>
  onChange: Dispatch<React.SetStateAction<PanelQuery>>
  labelWidth?: string
  spacing?: number
}) => {
  let lang = useStore(locale)
  return (
    <FormItem
      labelWidth={labelWidth}
      size='sm'
      spacing={spacing}
      title={lang == 'en' ? 'Format as' : '数据格式'}
      desc={
        lang == 'en'
          ? 'Timeseries format will aggregate fields that are neither of time nor number type into series label and name, Table format will keep all the fields from the query response, making it very suitable for Table panel.'
          : 'Timeseries 格式会将既不是时间也不是数值的字段聚合成 Series 名称和标签，而 Table 格式会保留所有字段，因此它特别适用于 Table 图表。'
      }
    >
      <Select
        size='sm'
        value={tempQuery.data['format']}
        onChange={(e) => {
          tempQuery.data['format'] = e.currentTarget.value
          const q = { ...tempQuery, data: cloneDeep(tempQuery.data) }
          setTempQuery(q)
          onChange(q)
        }}
        width='150px'
      >
        <option value={DataFormat.TimeSeries}>Time series</option>
        <option value={DataFormat.Table}>Table</option>
        <option value={DataFormat.Logs}>Logs</option>
        <option value={DataFormat.Traces}>Traces</option>
        <option value={DataFormat.NodeGraph}>NodeGraph</option>
        <option value={DataFormat.ValueList}>Value list</option>
      </Select>
    </FormItem>
  )
}

export default SelectDataFormat
