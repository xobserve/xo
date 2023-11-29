// Copyright 2023 xObserve.io Team

import { Datasource } from 'types/datasource'
import React from 'react'
import FormItem from 'components/form/Item'
import { Input, Text } from '@chakra-ui/react'
import { isEmpty } from 'utils/validate'
interface Props {
  datasource: Datasource
  onChange: any
}

const defaultUrl = 'localhost:9000'
const defaultData = { database: 'default', username: 'default', password: '' }
const DatasourceEditor = ({ datasource, onChange }: Props) => {
  if (datasource.url === null) {
    onChange((d) => {
      d.url = defaultUrl
    })
    return
  }

  if (isEmpty(datasource.data)) {
    onChange((d) => {
      d.data = defaultData
    })
    return
  }
  return (
    <>
      <Text>Clickhouse</Text>
      <FormItem title='URL'>
        <Input
          value={datasource.url}
          placeholder={defaultUrl}
          onChange={(e) => {
            const v = e.currentTarget.value
            onChange((d: Datasource) => {
              d.url = v
            })
          }}
        />
      </FormItem>
      <FormItem title='Database'>
        <Input
          value={datasource.data.database}
          onChange={(e) => {
            const v = e.currentTarget.value
            onChange((d: Datasource) => {
              d.data.database = v
            })
          }}
          placeholder='clickhouse database'
        />
      </FormItem>
      <FormItem title='Username'>
        <Input
          value={datasource.data.username}
          placeholder='clickhouse username'
          onChange={(e) => {
            const v = e.currentTarget.value
            onChange((d: Datasource) => {
              d.data.username = v
            })
          }}
        />
      </FormItem>
      <FormItem title='Password'>
        <Input
          type='password'
          value={datasource.data.password}
          placeholder='clickhouse password'
          onChange={(e) => {
            const v = e.currentTarget.value
            onChange((d: Datasource) => {
              d.data.password = v
            })
          }}
        />
      </FormItem>
    </>
  )
}

export default DatasourceEditor
