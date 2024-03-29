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

import React from 'react'
import { Button, Input, useToast } from '@chakra-ui/react'
import { Form, FormSection } from 'src/components/form/Form'
import FormItem from 'src/components/form/Item'
import Page from 'layouts/page/Page'
import { cloneDeep } from 'lodash'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { initDashboard } from 'src/data/dashboard'
import { Dashboard } from 'types/dashboard'
import { requestApi } from 'utils/axios/request'
import { useNavigate, useParams } from 'react-router-dom'
import { commonMsg, newMsg } from 'src/i18n/locales/en'
import { useStore } from '@nanostores/react'
import { getNewLinks } from './links'
import { navigateTo } from 'utils/url'

const NewDashboardPage = () => {
  const t = useStore(commonMsg)
  const t1 = useStore(newMsg)
  const toast = useToast()
  const [dashboard, setDashboard] = useState<Dashboard>(initDashboard())
  const teamId = useParams().teamId
  const newLinks = getNewLinks(teamId)

  const addDashboard = async () => {
    const res = await requestApi.post('/dashboard/save', {
      dashboard: { ...dashboard, ownedBy: Number(teamId) },
      changes: 'Newly created',
      isCreate: true,
    })
    toast({
      title: t1.dashToast,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    setTimeout(() => {
      navigateTo(`/${teamId}/${res.data}`)
    }, 1000)
  }

  return (
    <>
      <Page
        title={t.new}
        subTitle={t1.subTitle}
        icon={<FaPlus />}
        tabs={newLinks}
      >
        <Form
          alignItems='left'
          spacing={4}
          sx={{
            '.form-item-label': {
              width: '150px',
            },
          }}
          maxW={600}
        >
          <FormSection title={t1.dashInfo}>
            <FormItem title={t1.dashTitle}>
              <Input
                value={dashboard.title}
                onChange={(e) => {
                  dashboard.title = e.currentTarget.value
                  setDashboard(cloneDeep(dashboard))
                }}
              />
            </FormItem>
            <FormItem title={t.description}>
              <Input
                placeholder={t.inputTips({ name: t.description })}
                value={dashboard.data.description}
                onChange={(e) => {
                  dashboard.data.description = e.currentTarget.value
                  setDashboard(cloneDeep(dashboard))
                }}
              />
            </FormItem>
            {/* <FormItem title={t1.belongTeam}>
                        <Box sx={{
                            '.chakra-select': {
                                paddingLeft: '15px'
                            }
                        }}>
                            <Select value={dashboard.ownedBy} variant="flushed" onChange={e => setDashboard({ ...dashboard, ownedBy: Number(e.currentTarget.value) })}>
                                {teams.map(team => <option key={team.id} value={team.id}>
                                    <Text>{team.name}</Text>
                                </option>)}
                            </Select>
                        </Box>
                    </FormItem> */}
            <Button width='fit-content' onClick={addDashboard} mt='2' size='sm'>
              {t.submit}
            </Button>
          </FormSection>
        </Form>
      </Page>
    </>
  )
}

export default NewDashboardPage
