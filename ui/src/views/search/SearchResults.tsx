import { VStack } from "@chakra-ui/react";
import React, { memo, useState } from "react";
import { Dashboard } from "types/dashboard";
import DashboardCard from "../dashboard/components/DashboardCard";
import { Team } from "types/teams";
import { requestApi } from "utils/axios/request";

interface Props {
    dashboards: Dashboard[]
    onItemClick?: any
}

const SearchResults = memo(({ dashboards,onItemClick }: Props) => {
    const [teams, setTeams] = useState<Team[]>([])

    const load = async () => {
        const res = await requestApi.get("/teams/all")
        setTeams(res.data)
    }

    if (teams.length == 0) {
        load()
    }

    return (
        <VStack alignItems="left">
            {
                dashboards.map(dash => <DashboardCard dashboard={dash} owner={teams.find(team => team.id == dash.ownedBy)} onClick={onItemClick}/>)
            }
        </VStack>
    )
})

export default SearchResults;