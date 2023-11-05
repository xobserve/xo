// Copyright 2023 observex.io Team
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

import {  VStack } from "@chakra-ui/react";
import React, { memo } from "react";
import { Dashboard } from "types/dashboard";
import DashboardCard from "../dashboard/components/DashboardCard";
import { Team } from "types/teams";
import useSession from "hooks/use-session";
import PanelAccordion from "../dashboard/edit-panel/Accordion";

interface Props {
    teams: Team[]
    dashboards: Map<string, Dashboard[]>
    query: string
    onItemClick?: any
    starredIds: Set<string>
}

const TeamsView = memo(({teams, dashboards, query, onItemClick,starredIds }: Props) => {
    const {session} = useSession()
    const keys = Array.from(dashboards.keys()).sort()
    return (
        <>
            {
                keys.map(teamId => <PanelAccordion title={teams.find(t => t.id.toString() == teamId)?.name + ` ( ${dashboards.get(teamId).length} )`}>
                    <VStack alignItems="left">
                        {dashboards.get(teamId).map(dash => <DashboardCard dashboard={dash} owner={teams.find(team => team.id == dash.ownedBy)} onClick={onItemClick} query={query} starred={starredIds.has(dash.id)} session={session}/> )}
                    </VStack>
                </PanelAccordion>)
            }
        </>
    )
})

export default TeamsView;