// Copyright 2023 Datav.io Team
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
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import { FaAlignLeft, FaCog, FaConnectdevelop, FaTerminal, FaUserFriends } from "react-icons/fa"
import { MdOutlineDashboard } from "react-icons/md"
import { useStore } from "@nanostores/react"
import { cfgTeam } from "src/i18n/locales/en"
import { Box, Button, HStack, Select, Text } from "@chakra-ui/react"
import storage from "utils/localStorage"

const getTeamSubLinks = (id) => {
    return [
        { title: "datasource", url: `/cfg/team/${id}/datasources`, icon: <FaConnectdevelop /> },
        { title: "variable", url: `/cfg/team/${id}/variables`, icon: <FaTerminal /> },
        { title: "dashboard", url: `/cfg/team/${id}/dashboards`, icon: <MdOutlineDashboard /> },
        { title: "sidemenu", url: `/cfg/team/${id}/sidemenu`, icon: <FaAlignLeft /> },
        { title: "members", url: `/cfg/team/${id}/members`, icon: <FaUserFriends /> },
        { title: "settings", url: `/cfg/team/${id}/setting`, icon: <FaCog /> },
    ]
}

interface Props {
    children: any
}

export const StorageTeamNavId = "team-nav-id"

const TeamLayout = ({children}: Props) => {
    const t1 = useStore(cfgTeam)
    const params = useParams()
    const navigate = useNavigate()
    const id = params.id
    const tabLinks: Route[] = getTeamSubLinks(id)

    const [team, setTeam] = useState<Team>(null)
    const [teams, setTeams] = useState<Team[]>(null)
    const [onHover, setOnHover] = useState(false)

    useEffect(() => {
        loadTeams()
    },[])
    useEffect(() => {
        if (id) {
            load()
         
        }
    }, [id])

    const load = async () => {
        const res = await requestApi.get(`/team/byId/${id}`)
        setTeam(res.data)
    }
    
    const loadTeams = async () => {
        const res = await requestApi.get(`/teams/all`)
        setTeams(res.data)
    }

    return <>
        <Page title={t1.title} subTitle={
        <HStack mt="1" onMouseEnter={() => setOnHover(true)} onMouseLeave={() => setOnHover(false)} >
            <Text minWidth="fit-content">{`${t1.subTitle}`} - </Text>
            {teams && team &&  <Select width="fit-content" value={team.id} variant="unstyled" onChange={e => {
                const newTeamId = e.currentTarget.value 
                const url = location.pathname.replace(team.id.toString(), newTeamId)
                storage.set(StorageTeamNavId, newTeamId)
                navigate(url)
            }}>
                {
                    teams.map(t => <option value={t.id}>{t.name}</option>)
                }
            </Select>}
            {onHover && <Text fontSize="0.9rem" minWidth="fit-content" className="hover-text" opacity="0.7" cursor="pointer" onClick={() => navigate("/cfg/teams")}>{t1.viewAllTeams}</Text>}
        </HStack>} icon={<FaUserFriends />} tabs={tabLinks}>
            <Box key={team?.id}>
            {team && React.cloneElement(children, { team })}
            </Box>
        </Page>

    </>
}

export default TeamLayout