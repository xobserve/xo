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

import { Box, Text, VStack } from "@chakra-ui/react";
import React, { memo, useState } from "react";
import { Dashboard } from "types/dashboard";
import DashboardCard from "../dashboard/components/DashboardCard";
import { Team } from "types/teams";
import ColorTag from "src/components/ColorTag";
import useSession from "hooks/use-session";

interface Props {
    teams: Team[]
    dashboards: Map<string, Dashboard[]>
    query: string
    onItemClick?: any
    starredIds: Set<string>
    selectedTags: string[] 
}

const TagsView = memo(({teams, dashboards, query, onItemClick,starredIds,selectedTags }: Props) => {
    const {session} = useSession()
    const keys = Array.from(dashboards.keys()).sort().filter(tag => {
        if (selectedTags.length == 0) {
            return true
        }
        return selectedTags.includes(tag)
    })
    return (
        <>
            {
                keys.map(tag => <Box>
                    <ColorTag name={tag}/>
                    <VStack alignItems="left" mt="2">
                        {dashboards.get(tag).map(dash => <DashboardCard dashboard={dash} owner={teams.find(team => team.id == dash.ownedBy)} onClick={onItemClick} query={query} starred={starredIds.has(dash.id)} session={session}/> )}
                    </VStack>
                </Box>)
            }
        </>
    )
})

export default TagsView;