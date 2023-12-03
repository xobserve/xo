// Copyright 2023 xObserve.io Team

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

const NewDashboardPage = () => {
  const t = useStore(commonMsg)
  const t1 = useStore(newMsg)
  const toast = useToast()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<Dashboard>(initDashboard())
  const teamId = useParams().teamId
  const newLinks = getNewLinks(teamId)

  const addDashboard = async () => {
    const res = await requestApi.post('/dashboard/save', {
      dashboard: { ...dashboard, ownedBy: Number(teamId) },
      changes: 'Newly created',
    })
    toast({
      title: t1.dashToast,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })

    setTimeout(() => {
      navigate(`/${teamId}/${res.data}`)
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
            <Button width='fit-content' onClick={addDashboard}>
              {t.submit}
            </Button>
          </FormSection>
        </Form>
      </Page>
    </>
  )
}

export default NewDashboardPage
