import Page from "layouts/page/Page"
import React, { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Route } from "types/route"
import { Team } from "types/teams"
import { requestApi } from "utils/axios/request"
import { FaAlignLeft, FaCog, FaUserFriends } from "react-icons/fa"
import { MdOutlineDashboard } from "react-icons/md"

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
        const res = await requestApi.get(`/team/${id}`)
        setTeam(res.data)
    }
    
    return <>
        {team && <Page title={`Manage your team`} subTitle={`Current team - ${team?.name}`} icon={<FaUserFriends />} tabs={tabLinks}>
            {React.cloneElement(children, { team })}
        </Page>}

    </>
}

export default TeamLayout