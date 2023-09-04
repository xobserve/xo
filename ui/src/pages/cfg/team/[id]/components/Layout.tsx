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
import { useParams } from "react-router-dom"
import { Route } from "types/route"
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import { FaAlignLeft, FaCog, FaUserFriends } from "react-icons/fa"
import { MdOutlineDashboard } from "react-icons/md"
import { useStore } from "@nanostores/react"
import { cfgTeam } from "src/i18n/locales/en"

const getTeamSubLinks = (id) => {
    return [
        { title: "members", url: `/cfg/team/${id}/members`, icon: <FaUserFriends /> },
        { title: "dashboard", url: `/cfg/team/${id}/dashboards`, icon: <MdOutlineDashboard /> },
        { title: "sidemenu", url: `/cfg/team/${id}/sidemenu`, icon: <FaAlignLeft /> },
        { title: "settings", url: `/cfg/team/${id}/setting`, icon: <FaCog /> },
    ]
}

interface Props {
    children: any
}
const TeamLayout = ({children}: Props) => {
    const t1 = useStore(cfgTeam)
    const params = useParams()
    const id = params.id
    const tabLinks: Route[] = getTeamSubLinks(id)

    const [team, setTeam] = useState<Team>(null)

    useEffect(() => {
        if (id) {
            load()
        }
    }, [id])

    const load = async () => {
        const res = await requestApi.get(`/team/byId/${id}`)
        setTeam(res.data)
    }
    
    return <>
        <Page title={t1.title} subTitle={`${t1.subTitle} - ${team?.name}`} icon={<FaUserFriends />} tabs={tabLinks}>
            {team && React.cloneElement(children, { team })}
        </Page>

    </>
}

export default TeamLayout