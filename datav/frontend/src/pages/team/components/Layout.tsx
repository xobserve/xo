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

import Page from 'layouts/page/Page'
import React, { useEffect, useState } from 'react'
import { Route } from 'types/route'
import {
  FaAlignLeft,
  FaCog,
  FaConnectdevelop,
  FaProjectDiagram,
  FaTerminal,
  FaUserFriends,
} from 'react-icons/fa'
import { MdOutlineDashboard } from 'react-icons/md'
import { useStore } from '@nanostores/react'
import { cfgTeam } from 'src/i18n/locales/en'
import { Box, HStack, Text } from '@chakra-ui/react'
import { isEmpty } from 'utils/validate'
import { $config } from 'src/data/configs/config'
import { requestApi } from 'utils/axios/request'
import { Team } from 'types/teams'
import { getNavigateTo } from 'utils/url'
import { initVariableSelected } from 'src/views/variables/Loader'
import { $variables } from 'src/views/variables/store'
import { $datasources } from 'src/views/datasource/store'

const getTeamSubLinks = (teamId) => {
  let teamPath = ''
  if (!isEmpty(teamId)) {
    teamPath = `/${teamId}`
  }
  return [
    {
      title: 'datasource',
      url: getNavigateTo(`${teamPath}/cfg/team/datasources`),
      icon: <FaConnectdevelop />,
    },
    {
      title: 'variable',
      url: getNavigateTo(`${teamPath}/cfg/team/variables`),
      icon: <FaTerminal />,
    },
    {
      title: 'dashboard',
      url: getNavigateTo(`${teamPath}/cfg/team/dashboards`),
      icon: <MdOutlineDashboard />,
    },
    {
      title: 'sidemenu',
      url: getNavigateTo(`${teamPath}/cfg/team/sidemenu`),
      icon: <FaAlignLeft />,
    },
    {
      title: 'members',
      url: getNavigateTo(`${teamPath}/cfg/team/members`),
      icon: <FaUserFriends />,
    },
    {
      title: 'template',
      url: getNavigateTo(`${teamPath}/cfg/team/templates`),
      icon: <FaProjectDiagram />,
    },
    {
      title: 'settings',
      url: getNavigateTo(`${teamPath}/cfg/team/setting`),
      icon: <FaCog />,
    },
  ]
}

interface Props {
  children: any
}

export const StorageTeamNavId = 'team-nav-id'

const TeamLayout = ({ children }: Props) => {
  const t1 = useStore(cfgTeam)
  const config = useStore($config)
  const [team, setTeam] = useState<Team>(null)
  useEffect(() => {
    load()
  }, [])

  const tabLinks: Route[] = getTeamSubLinks(config.currentTeam)

  const load = async () => {
    const res0 = await requestApi.get(`/team/byId/${config.currentTeam}`)
    const teamId = res0.data.id

    const res = await requestApi.get(`/variable/team?teamId=${teamId}`)
    initVariableSelected(res.data)
    $variables.set(res.data)

    const res1 = await requestApi.get(`/datasource/all?teamId=${teamId}`)
    $datasources.set(res1.data)

    setTeam(res0.data)
  }

  return (
    <>
      <Page
        title={t1.title}
        subTitle={
          <HStack mt='1'>
            <Text minWidth='fit-content'>
              {`${t1.subTitle}`} - {team?.name}
            </Text>
          </HStack>
        }
        icon={<FaUserFriends />}
        tabs={tabLinks}
      >
        <Box key={team?.id}>
          {team && React.cloneElement(children, { team, load })}
        </Box>
      </Page>
    </>
  )
}

export default TeamLayout
