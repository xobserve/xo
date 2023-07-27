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
import { Box, Flex, HStack, Select, Tooltip } from "@chakra-ui/react"
import IconButton from "components/button/IconButton"
import SelectVariables from "src/views/variables/Variables"
import { cloneDeep, find, isEmpty } from "lodash"
import React from "react";
import { memo, useEffect, useRef, useState } from "react"
import { MdSync } from "react-icons/md"
import { TimeRefreshEvent, VariableChangedEvent } from "src/data/bus-events"
import ReserveUrls from "src/data/reserve-urls"
import { Dashboard } from "types/dashboard"
import { Team } from "types/teams"
import useBus, { dispatch } from "use-bus"
import { requestApi } from "utils/axios/request"
import AddPanel from "./AddPanel"
import { variables } from "./Dashboard"
import DashboardSave from "./DashboardSave"
import DashboardSettings from "./settings/DashboardSettings"
import Fullscreen from "components/Fullscreen"
import useFullscreen from "hooks/useFullscreen"
import DatePicker from "components/DatePicker/DatePicker"
import { useNavigate } from "react-router-dom"
import { useStore } from "@nanostores/react";
import { dashboardMsg } from "src/i18n/locales/en";
import DashboardShare from "./DashboardShare";
import DashboardStar from "./components/DashboardStar";

interface HeaderProps {
    dashboard: Dashboard
    onChange: any
    sideWidth?: number
}
const DashboardHeader = memo(({ dashboard, onChange, sideWidth }: HeaderProps) => {
    const t1 = useStore(dashboardMsg)
    const navigate = useNavigate()
    const [variablesChanged, setVariablesChanged] = useState(0)
    const [refresh, setRefresh] = useState(0)
    const [team, setTeam] = useState<Team>(null)
    const fullscreen = useFullscreen()

    useEffect(() => {
        getTeam()
    }, [])

    const getTeam = async () => {
        const res1 = await requestApi.get(`/team/${dashboard.ownedBy}`)
        setTeam(res1.data)
    }

    const refreshH = useRef(null)

    useEffect(() => {
        if (refresh > 0) {
            refreshH.current = setInterval(() => {
                refreshOnce()
            }, 1000 * refresh)
        } else {
            clearInterval(refreshH.current)
        }

        return () => {
            clearInterval(refreshH.current)
        }
    }, [refresh])

    const refreshOnce = () => {
        dispatch(TimeRefreshEvent)
    }

    useBus(
        VariableChangedEvent,
        () => {
            console.log("dash header recv variable change event:", variables);
            setVariablesChanged(variablesChanged + 1)
        },
        [variablesChanged]
    )

    return (
        <Box
            id="dashboard-header"
            display={fullscreen ? "none" : "block"}
            py="1"
            width={sideWidth ? `calc(100% - ${sideWidth})` : "100%"}
            position={sideWidth ? "fixed" : "static"}
            top="0"
            right="12px"
            left={sideWidth + 12 + 'px'}
            bg={(dashboard.data.styles.bgEnabled && dashboard.data.styles?.bg) ? 'transparent' : 'var(--chakra-colors-chakra-body-bg)'}
            zIndex={1}
            transition="all 0.2s"
        >
            {team &&
                <>
                    <Flex justifyContent="space-between" >
                        <HStack textStyle="title">
                            <Tooltip label={t1.headerTeamTips}><Box cursor="pointer" onClick={() => navigate(`${ReserveUrls.Config}/team/${team.id}/members`)}>{team?.name}</Box></Tooltip>
                            <Box>/</Box>
                            <Box>{dashboard.title}</Box>
                            <DashboardStar dashboardId={dashboard.id} fontSize="1.2rem" />
                            <DashboardShare dashboard={dashboard} fontSize="0.9rem" opacity="0.8" cursor="pointer" className="hover-text" />
                        </HStack>

                        <HStack mr="2">
                            <HStack spacing="0">
                                <AddPanel dashboard={dashboard} onChange={onChange} />
                                <DashboardSave dashboard={dashboard} />
                                {dashboard && <DashboardSettings dashboard={dashboard} onChange={onChange} />}
                                <DatePicker showTime />
                                <HStack spacing={0}>
                                    <Tooltip label={t1.refreshOnce}><Box onClick={refreshOnce}><IconButton variant="ghost"><MdSync /></IconButton></Box></Tooltip>
                                    <Tooltip label={t1.refreshInterval}>
                                        <Select variant="unstyled" value={refresh} onChange={(e) => setRefresh(Number(e.target.value))}>
                                            <option value={0}>OFF</option>
                                            <option value={5}>5s</option>
                                            <option value={10}>10s</option>
                                            <option value={30}>30s</option>
                                            <option value={60}>1m</option>
                                        </Select>
                                    </Tooltip>
                                    <Fullscreen />
                                </HStack>


                            </HStack>

                        </HStack>

                    </Flex>
                    {!isEmpty(variables) && <Flex justifyContent="space-between" mt="0">
                        <SelectVariables id={variablesChanged} variables={variables.filter((v) => v.id.toString().startsWith("d-"))} />
                        <SelectVariables id={variablesChanged} variables={variables.filter((v) => !v.id.toString().startsWith("d-") && !find(dashboard.data.hidingVars?.split(','), v1 => v1 == v.name))} />
                    </Flex>}
                </>}
        </Box>
    )
})

export default DashboardHeader