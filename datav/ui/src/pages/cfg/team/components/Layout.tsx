// Copyright 2023 xObserve.io Team
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

import Page from "layouts/page/Page"
import React from "react"
import { Route } from "types/route"
import { FaAlignLeft, FaCog, FaConnectdevelop, FaTerminal, FaUserFriends } from "react-icons/fa"
import { MdOutlineDashboard } from "react-icons/md"
import { useStore } from "@nanostores/react"
import { cfgTeam } from "src/i18n/locales/en"
import { Box, HStack, Select, Text } from "@chakra-ui/react"
import { $teams } from "src/views/team/store"
import {  $variables } from "src/views/variables/store"
import SelectVariables from "src/views/variables/SelectVariable"
import { isEmpty } from "utils/validate"
import { useParams } from "react-router-dom"
import { $config } from "src/data/configs/config"

const getTeamSubLinks = (teamId) => {
    let teamPath = ''
    if (!isEmpty(teamId)) {
        teamPath = `/${teamId}`
    }
    return [
        { title: "datasource", url: `${teamPath}/cfg/team/datasources`, icon: <FaConnectdevelop /> },
        { title: "variable", url: `${teamPath}/cfg/team/variables`, icon: <FaTerminal /> },
        { title: "dashboard", url: `${teamPath}/cfg/team/dashboards`, icon: <MdOutlineDashboard /> },
        { title: "sidemenu", url: `${teamPath}/cfg/team/sidemenu`, icon: <FaAlignLeft /> },
        { title: "members", url: `${teamPath}/cfg/team/members`, icon: <FaUserFriends /> },
        { title: "settings", url: `${teamPath}/cfg/team/setting`, icon: <FaCog /> },
    ]
}

interface Props {
    children: any
}

export const StorageTeamNavId = "team-nav-id"

const TeamLayout = ({ children }: Props) => {
    const t1 = useStore(cfgTeam)
    const config = useStore($config)
    const id = config.currentTeam.toString()
    
    const teamId = useParams().teamId
    const tabLinks: Route[] = getTeamSubLinks(teamId)

    const teams = useStore($teams)
    const team = teams?.find(t => t.id.toString() == (teamId ?? id))
    const vars = useStore($variables)

    return <>
        <Page
            title={t1.title}
            subTitle={
                <HStack mt="1">
                    <Text minWidth="fit-content">{`${t1.subTitle}`} - {team?.name}</Text>
                </HStack>} icon={<FaUserFriends />}
            tabs={tabLinks}>
            <Box key={team?.id}>
                {team && React.cloneElement(children, { team })}
            </Box>
        </Page>
        <Box visibility="hidden"><SelectVariables variables={vars} /></Box>
    </>
}

export default TeamLayout