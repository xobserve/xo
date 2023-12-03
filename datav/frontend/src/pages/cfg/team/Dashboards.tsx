// Copyright 2023 xObserve.io Team

import {
  Box,
  Button,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Flex,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReserveUrls from 'src/data/reserve-urls'
import { commonMsg } from 'src/i18n/locales/en'
import { Dashboard } from 'types/dashboard'
import { Team } from 'types/teams'
import { requestApi } from 'utils/axios/request'
import Loading from 'src/components/loading/Loading'

const TeamDashboards = ({ team }: { team: Team }) => {
  const t = useStore(commonMsg)
  const navigate = useNavigate()

  const teamId = useParams().teamId
  const [dashboards, setDashboards] = useState<Dashboard[]>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const res1 = await requestApi.get(`/dashboard/team/${team.id}`)
    setDashboards(res1.data)
  }

  return (
    <>
      <Box>
        <Flex justifyContent='space-between'>
          <Box></Box>
          <Button
            size='sm'
            onClick={() =>
              navigate(`/${teamId}${ReserveUrls.New}/dashboard?team=${team.id}`)
            }
          >
            {t.newItem({ name: t.dashboard })}
          </Button>
        </Flex>
        {dashboards ? (
          <TableContainer>
            <Table variant='simple' className='color-border-table'>
              <Thead>
                <Tr>
                  <Th>{t.name}</Th>
                  <Th>Id</Th>
                  <Th>{t.created}</Th>
                  <Th>{t.updated}</Th>
                  <Th>{t.action}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dashboards?.map((dash) => {
                  return (
                    <Tr key={dash.id}>
                      <Td>{dash.title}</Td>
                      <Td>{dash.id}</Td>
                      <Td>{moment(dash.created).fromNow()}</Td>
                      <Td>{moment(dash.updated).fromNow()}</Td>
                      <Td>
                        <Button
                          variant='ghost'
                          size='sm'
                          px='0'
                          onClick={() => navigate(`/${teamId}/${dash.id}`)}
                        >
                          {t.manage}
                        </Button>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Loading style={{ marginTop: '50px' }} />
        )}
      </Box>
    </>
  )
}

export default TeamDashboards
