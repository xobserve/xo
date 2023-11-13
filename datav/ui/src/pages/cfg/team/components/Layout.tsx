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
import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Route } from "types/route"
import { globalTeamId } from "types/teams"
import { FaAlignLeft, FaCog, FaConnectdevelop, FaTerminal, FaUserFriends } from "react-icons/fa"
import { MdOutlineDashboard } from "react-icons/md"
import { useStore } from "@nanostores/react"
import { cfgTeam } from "src/i18n/locales/en"
import { Box, HStack, Select, Text } from "@chakra-ui/react"
import { $teams } from "src/views/team/store"
import { $datasources } from "src/views/datasource/store"
import { defaultDatasourceId } from "types/datasource"
import { concat } from "lodash"
import {  $variables } from "src/views/variables/store"
import SelectVariables from "src/views/variables/SelectVariable"
import useSession from "hooks/use-session"

const getTeamSubLinks = () => {
    return [
        { title: "datasource", url: `/cfg/team/datasources`, icon: <FaConnectdevelop /> },
        { title: "variable", url: `/cfg/team/variables`, icon: <FaTerminal /> },
        { title: "dashboard", url: `/cfg/team/dashboards`, icon: <MdOutlineDashboard /> },
        { title: "sidemenu", url: `/cfg/team/sidemenu`, icon: <FaAlignLeft /> },
        { title: "members", url: `/cfg/team/members`, icon: <FaUserFriends /> },
        { title: "settings", url: `/cfg/team/setting`, icon: <FaCog /> },
    ]
}

interface Props {
    children: any
}

export const StorageTeamNavId = "team-nav-id"

const TeamLayout = ({ children }: Props) => {
    const t1 = useStore(cfgTeam)
    const { session } = useSession()
    const id = session?.user.currentTeam.toString()
    const tabLinks: Route[] = getTeamSubLinks()

    const teams = useStore($teams)
    const team = teams?.find(t => t.id.toString() == id)
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