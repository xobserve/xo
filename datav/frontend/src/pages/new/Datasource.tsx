// Copyright 2023 xObserve.io Team

import React from 'react'
import { FormSection } from 'src/components/form/Form'
import Page from 'layouts/page/Page'
import { FaPlus } from 'react-icons/fa'
import DatasourceEditor from 'src/views/datasource/Editor'
import { Datasource } from 'types/datasource'
import { commonMsg, newMsg } from 'src/i18n/locales/en'
import { useStore } from '@nanostores/react'
import { DatasourceTypePrometheus } from 'src/views/dashboard/plugins/built-in/datasource/prometheus/types'
import { useParams } from 'react-router-dom'
import { getNewLinks } from './links'

const NewDatasourcePage = () => {
  const t = useStore(commonMsg)
  const t1 = useStore(newMsg)

  const teamId = useParams().teamId
  const newLinks = getNewLinks(teamId)

  const initDatasource: Datasource = {
    id: null,
    name: '',
    url: null,
    type: DatasourceTypePrometheus,
    data: {},
    teamId: Number(teamId),
  }

  return (
    <>
      <Page
        title={t.new}
        subTitle={t1.subTitle}
        icon={<FaPlus />}
        tabs={newLinks}
      >
        <FormSection maxW='500px' title={t1.dsInfo}>
          <DatasourceEditor ds={initDatasource} />
        </FormSection>
      </Page>
    </>
  )
}

export default NewDatasourcePage
