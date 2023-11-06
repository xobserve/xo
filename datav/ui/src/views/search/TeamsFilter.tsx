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

import { AiOutlineTeam } from "react-icons/ai"
import CustomSelect from "src/components/select/AntdSelect"
import React from "react";
import { Team } from "types/teams";
import { Box } from "@chakra-ui/react";
import { useStore } from "@nanostores/react";
import { searchMsg } from "src/i18n/locales/en";

interface Props {
    teams: Team[]
    value: number[]
    onChange: any
    teamCount: Object
    minWidth?: string
}
const TeamsFilter = ({ value, teams, onChange, teamCount, minWidth }: Props) => {
    const t1 = useStore(searchMsg)
    return (
        <>
            <CustomSelect
                prefixIcon={
                    <Box color="gray.500">
                        <AiOutlineTeam />
                    </Box>
                }
                placeholder={t1.filterTeams}
                size="middle"
                allowClear
                mode="multiple"
                style={{ width: 'fit-content', minWidth }}
                defaultValue={value}
                onChange={onChange}
                options={
                    teams.map(t => {
                        return {
                            label: t.name + ` (${teamCount[t.id] ?? 0})`,
                            value: t.id
                        }
                    })
                }
            />
        </>
    )
}

export default TeamsFilter