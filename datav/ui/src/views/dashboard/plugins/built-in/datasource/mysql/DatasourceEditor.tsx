// Copyright 2023 xObserve.io Team

import { Input } from '@chakra-ui/react'
import FormItem from 'src/components/form/Item'
import { Datasource } from 'types/datasource'
import React from 'react'
import { FormSection } from 'components/form/Form'
import { Updater } from 'use-immer'

interface Props {
  datasource: Datasource
  onChange: Updater<Datasource>
}

const DatasourceEditor = ({ datasource, onChange }: Props) => {
  return (
    <>
      <FormSection title='Connection'>
        <FormItem title='Host URL'>
          <Input
            value={datasource.url}
            placeholder={'localhost:3306'}
            required
            onChange={(e) => {
              const v = e.currentTarget.value
              onChange((d: Datasource) => {
                d.url = v
              })
            }}
          />
        </FormItem>
      </FormSection>
      <FormSection title='Authentication'>
        <FormItem title={'Database name'}>
          <Input
            value={datasource.data.database}
            placeholder='Database'
            onChange={(e) => {
              const v = e.currentTarget.value
              onChange((d: Datasource) => {
                d.data['database'] = v
              })
            }}
          />
        </FormItem>
        <FormItem title={'Username'}>
          <Input
            value={datasource.data.username}
            placeholder='Username'
            onChange={(e) => {
              const v = e.currentTarget.value
              onChange((d: Datasource) => {
                d.data['username'] = v
              })
            }}
          />
        </FormItem>
        <FormItem title={'Password'}>
          <Input
            value={datasource.data.password}
            placeholder='Password'
            type='password'
            onChange={(e) => {
              const v = e.currentTarget.value
              onChange((d: Datasource) => {
                d.data['password'] = v
              })
            }}
          />
        </FormItem>
      </FormSection>
    </>
  )
}

export default DatasourceEditor
