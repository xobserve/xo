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
import { Box, Flex, HStack, Select, Tooltip, useMediaQuery } from "@chakra-ui/react"
import IconButton from "src/components/button/IconButton"
import SelectVariables from "src/views/variables/SelectVariable"
import { find, isEmpty, orderBy } from "lodash"
import React from "react";
import { memo, useEffect, useRef, useState } from "react"
import { MdSync } from "react-icons/md"
import { TimeRefreshEvent } from "src/data/bus-events"
import ReserveUrls from "src/data/reserve-urls"
import { Dashboard } from "types/dashboard"
import  { dispatch } from "use-bus"
import AddPanel from "./AddPanel"
import DashboardSave from "./DashboardSave"
import DashboardSettings from "./settings/DashboardSettings"
import Fullscreen from "src/components/Fullscreen"
import useFullscreen from "hooks/useFullscreen"
import DatePicker from "src/components/DatePicker/DatePicker"
import { useNavigate } from "react-router-dom"
import { useStore } from "@nanostores/react";
import { dashboardMsg } from "src/i18n/locales/en";
import DashboardShare from "./DashboardShare";
import DashboardStar from "./components/DashboardStar";
import { $variables } from "../variables/store";
import { MobileBreakpoint } from "src/data/constants";
import CustomScrollbar from "src/components/CustomScrollbar/CustomScrollbar";

interface HeaderProps {
    dashboard: Dashboard
    onChange: any
    sideWidth?: number
}
const DashboardHeader = memo(({ dashboard, onChange, sideWidth }: HeaderProps) => {
    const vars = useStore($variables)
    const t1 = useStore(dashboardMsg)
    const navigate = useNavigate()
    const [refresh, setRefresh] = useState(0)
    const fullscreen = useFullscreen()


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

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)

    const dvars = orderBy(vars.filter((v) => v.id.toString().startsWith("d-")),['sortWeight','name'], ['desc','asc'])
    const gvars = orderBy(vars.filter((v) => !v.id.toString().startsWith("d-") && !find(dashboard.data.hidingVars?.split(','), v1 => v.name.toLowerCase().match(v1))),['sortWeight','name'], ['desc','asc'])

    return (
        <Box

            id="dashboard-header"
            display={fullscreen ? "none" : "block"}
            pt="1"
            // width={sideWidth ? `calc(100% - ${sideWidth})` : "100%"}
            position={sideWidth ? "fixed" : "static"}
            top="0"
            right="0"
            left={sideWidth  + 'px'}
            px="10px"
            bg={(dashboard.data.styles.bgEnabled && dashboard.data.styles?.bg) ? 'transparent' : 'var(--chakra-colors-chakra-body-bg)'}
            zIndex={1001}
            transition="all 0.2s"
        >
            {
                <>
                    <Flex justifyContent="space-between" >
                        <HStack textStyle={isLargeScreen ? "title" : null} pl={isLargeScreen ? 0 : "17px"}>
                            {isLargeScreen && <>
                                <Tooltip label={t1.headerTeamTips}><Box cursor="pointer" onClick={() => navigate(`${ReserveUrls.Config}/team/${dashboard.ownedBy}/members`)}>{dashboard.ownerName}</Box></Tooltip>
                                <Box>/</Box>
                            </>}
                            <Box>{dashboard.title}</Box>
                            {isLargeScreen && <>
                                <DashboardStar dashboardId={dashboard.id} fontSize="1.2rem" />
                                <DashboardShare dashboard={dashboard} fontSize="0.9rem" opacity="0.8" cursor="pointer" className="hover-text" />
                            </>}
                        </HStack>

                        <HStack>
                            <HStack spacing="0">
                                <AddPanel dashboard={dashboard} onChange={onChange} />
                                <DashboardSave dashboard={dashboard} />
                                {dashboard && <DashboardSettings dashboard={dashboard} onChange={onChange} />}
                                <DatePicker showTime />
                                {isLargeScreen && <HStack spacing={0}>
                                    <Tooltip label={t1.refreshOnce}><Box onClick={refreshOnce}><IconButton variant="ghost"><MdSync /></IconButton></Box></Tooltip>
                                    <Tooltip label={t1.refreshInterval}>
                                        <Select variant="unstyled" value={refresh} onChange={(e) => setRefresh(Number(e.target.value))}>
                                            <option value={0}>off</option>
                                            <option value={5}>5s</option>
                                            <option value={10}>10s</option>
                                            <option value={30}>30s</option>
                                            <option value={60}>1m</option>
                                        </Select>
                                    </Tooltip>
                                    <Fullscreen />
                                </HStack>}


                            </HStack>

                        </HStack>

                    </Flex>
                    {!isEmpty(vars) &&
                        <Flex mt="0" maxW={`calc(100% - ${10}px)`}>
                            <CustomScrollbar hideVerticalTrack>
                                <Flex justifyContent="space-between" >
                                    <SelectVariables variables={dvars} />
                                    <SelectVariables variables={gvars} />
                                </Flex>
                            </CustomScrollbar>
                        </Flex>}
                </>}
        </Box>
    )
})

export default DashboardHeader