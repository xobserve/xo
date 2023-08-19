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

import { useColorMode } from "@chakra-ui/react"
import { getCurrentTimeRange } from "components/DatePicker/TimePicker"
import React, { useEffect, useState } from "react"
import { TimeChangedEvent } from "src/data/bus-events"
import { Dashboard } from "types/dashboard"
import useBus from "use-bus"
import { requestApi } from "utils/axios/request"
import { paletteColorNameToHex } from "utils/colors"
import { roundDsTime } from "utils/datasource"
import { $dashAnnotations, $rawDashAnnotations } from "./store/annotation"
import { isEmpty } from "utils/validate"
import { useStore } from "@nanostores/react"

interface Props {
    dashboard: Dashboard
}
const DashboardAnnotations = ({ dashboard }: Props) => {
    const { colorMode } = useColorMode()
    const rawAnnotations = useStore($rawDashAnnotations)
    useBus(
        TimeChangedEvent,
        (e) => {
            loadAnnotations()
        },
        [dashboard]
    )
    
    useEffect(() => {
        loadAnnotations()
    }, [])
    
    useEffect(() => {
        filterAnnotations(rawAnnotations)
    },[rawAnnotations])
    
    useEffect(() => {
        if (rawAnnotations.length > 0) {
            filterAnnotations(rawAnnotations)
        }
    },[dashboard.data.annotation.tagsFilter, dashboard.data.annotation.color])

    const loadAnnotations = async () => {
        const timerange = getCurrentTimeRange()
        const res = await requestApi.get(`/annotation/${dashboard.id}?start=${roundDsTime(timerange.start.getTime() / 1000)}&end=${roundDsTime(timerange.end.getTime() / 1000)}`)
        $rawDashAnnotations.set(res.data)
    }

    const filterAnnotations = (annotations) => {
        const newAnnotations = []
        for (const anno of (annotations)) {
            anno.color = paletteColorNameToHex(dashboard.data.annotation.color, colorMode)
            const tf = dashboard.data.annotation.tagsFilter
            if (!isEmpty(tf)) {
                const tagsFilter = tf.split(',')
                if (anno.tags.some(t => tagsFilter.includes(t))) {
                    newAnnotations.push(anno)
                }
            } else {
                newAnnotations.push(anno)
            }
        }
        $dashAnnotations.set([...newAnnotations])
    }
    return (<></>)
}

export default DashboardAnnotations