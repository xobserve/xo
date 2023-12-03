// Copyright 2023 xObserve.io Team

import { Input } from '@chakra-ui/react'
import FormItem from 'src/components/form/Item'
import { Datasource } from 'types/datasource'
import isURL from 'validator/lib/isURL'
import React from 'react'

interface Props {
  datasource: Datasource
  onChange: any
}

const defaultUrl = 'http://localhost:3100'
const LokiDatasourceEditor = ({ datasource, onChange }: Props) => {
  if (datasource.url === null) {
    onChange((d) => {
      d.url = defaultUrl
    })
    return
  }

  return (
    <>
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
    </>
  )
}

export default LokiDatasourceEditor

export const isLokiDatasourceValid = (ds: Datasource) => {
  if (!isURL(ds.url, { require_tld: false })) {
    return 'invalid url'
  }
}
