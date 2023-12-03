// Copyright 2023 xObserve.io Team

import Page from 'layouts/page/Page'
import React, { useEffect, useState } from 'react'
import { Route } from 'types/route'
import {
  FaAlignLeft,
  FaCog,
  FaConnectdevelop,
  FaTerminal,
  FaUserFriends,
} from 'react-icons/fa'
import { MdOutlineDashboard } from 'react-icons/md'
import { useStore } from '@nanostores/react'
import { cfgTeam } from 'src/i18n/locales/en'
import { Box, HStack, Select, Text } from '@chakra-ui/react'
import { isEmpty } from 'utils/validate'
import { $config } from 'src/data/configs/config'
import { requestApi } from 'utils/axios/request'
import { Team } from 'types/teams'

const getTeamSubLinks = (teamId) => {
  let teamPath = ''
  if (!isEmpty(teamId)) {
    teamPath = `/${teamId}`
  }
  return [
    {
      title: 'datasource',
      url: `${teamPath}/cfg/team/datasources`,
      icon: <FaConnectdevelop />,
    },
    {
      title: 'variable',
      url: `${teamPath}/cfg/team/variables`,
      icon: <FaTerminal />,
    },
    {
      title: 'dashboard',
      url: `${teamPath}/cfg/team/dashboards`,
      icon: <MdOutlineDashboard />,
    },
    {
      title: 'sidemenu',
      url: `${teamPath}/cfg/team/sidemenu`,
      icon: <FaAlignLeft />,
    },
    {
      title: 'members',
      url: `${teamPath}/cfg/team/members`,
      icon: <FaUserFriends />,
    },
    { title: 'settings', url: `${teamPath}/cfg/team/setting`, icon: <FaCog /> },
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
    const res = await requestApi.get(`/team/byId/${config.currentTeam}`)
    setTeam(res.data)
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
          {team && React.cloneElement(children, { team })}
        </Box>
      </Page>
    </>
  )
}

export default TeamLayout
