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

import { useMediaQuery } from "@chakra-ui/react";
import { Select } from "antd";
import ColorTag from "src/components/ColorTag";
import type { CustomTagProps } from 'rc-select/lib/BaseSelect';
import React from "react";
import { MobileBreakpoint } from "src/data/constants";
import { Team } from "types/teams";
const { Option } = Select;

interface Props {
    teams: Team[]
    value: number[]
    onChange: any
    teamCount: Object
    minWidth?: string
}
const TeamsFilter = ({ value, teams, onChange,teamCount, minWidth }: Props) => {
    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    return (
        <>
            <Select
                placeholder="filter by teams, result = t1 || t2"
                size="large"
                allowClear
                mode="multiple"
                style={{ width: 'fit-content', minWidth }}
                defaultValue={value}
                onChange={onChange}
                options= {
                    teams.map(t => {
                        return {
                            label: t.name+` (${teamCount[t.id]??0})`,
                            value: t.id
                        }
                    })
                }
            />
        </>
    )
}

export default TeamsFilter