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
import { Box, Flex, HStack, Tooltip, useMediaQuery } from "@chakra-ui/react"
import SelectVariables from "src/views/variables/SelectVariable"
import {  isEmpty } from "lodash"
import React from "react";
import { memo } from "react"
import ReserveUrls from "src/data/reserve-urls"
import { Dashboard } from "types/dashboard"
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
import DashboardRefresh from "./DashboardRefresh";
import { catelogVariables } from "../variables/utils";

interface HeaderProps {
    dashboard: Dashboard
    onChange: any
    sideWidth?: number
}
const DashboardHeader = memo(({ dashboard, onChange, sideWidth }: HeaderProps) => {
    const vars = useStore($variables)
    const t1 = useStore(dashboardMsg)
    const navigate = useNavigate()
    const fullscreen = useFullscreen()


    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    const [dvars, gvars] = catelogVariables(vars, dashboard)
  
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
                                <DashboardStar dashboardId={dashboard.id} fontSize="1.1rem" />
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
                                    <DashboardRefresh />
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
