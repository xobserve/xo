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

import { Box, HStack, Tooltip } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import React, { useEffect, useRef, useState } from "react"
import { MdSync } from "react-icons/md"
import { dashboardMsg } from "src/i18n/locales/en"
import IconButton from "src/components/button/IconButton"
import { dispatch } from "use-bus"
import { TimeRefreshEvent } from "src/data/bus-events"
import { useSearchParam } from "react-use"
import { addParamToUrl, removeParamFromUrl } from "utils/url"
import { Select } from "antd"
import { durationToSeconds } from "utils/date"

export const REFRESH_OFF = "OFF" 
const DashboardRefresh = () => {
    const t1 = useStore(dashboardMsg)
    
    const refreshSearch = useSearchParam("refresh")
    const [refresh, setRefresh] = useState(refreshSearch?? REFRESH_OFF)
    const refreshH = useRef(null)

    useEffect(() => {
        const r = durationToSeconds(refresh)
        if (r > 0) {
            refreshH.current = setInterval(() => {
                refreshOnce()
            }, 1000 * r)
        }

        return () => {
            clearInterval(refreshH.current)
        }
    }, [refresh])

    const refreshOnce = () => {
        dispatch(TimeRefreshEvent)
    }

    const onRereshChange = v => {
        setRefresh(v)
        if (v != REFRESH_OFF) {
            addParamToUrl({ refresh: v })
        } else {
            removeParamFromUrl(["refresh"])
        }
    }
    return (<>
        <Tooltip label={t1.refreshOnce}><Box onClick={refreshOnce}><IconButton variant="ghost"><MdSync /></IconButton></Box></Tooltip>
        <Box sx={{
            '.ant-select-selector': {
                paddingLeft: "0px !important"
            }
        }}>
            <Select popupMatchSelectWidth={false} bordered={false} value={refresh} onChange={(v) => onRereshChange(v)} options={[REFRESH_OFF,'2s', '5s','10s','30s', '1m'].map(v => ({value:v,label:v}))}/>
        </Box>
    </>)
}

export default DashboardRefresh