import { Box } from "@chakra-ui/react"
import PageContainer from "layouts/page-container"
import { useCallback, useEffect, useState } from "react"
import { Dashboard, Panel } from "types/dashboard"
import { requestApi } from "utils/axios/request"
import DashboardHeader from "src/views/dashboard/DashboardHeader"
import DashboardGrid from "src/views/dashboard/grid/DashboardGrid"
import { cloneDeep, concat, defaults, defaultsDeep, find } from "lodash"
import { TimeRange } from "types/time"
import { getInitTimeRange } from "components/TimePicker"
import { Variable } from "types/variable"
import { setVariableSelected } from "src/views/variables/Variables"
import { prevQueries, prevQueryData } from "src/views/dashboard/grid/PanelGrid"
import { unstable_batchedUpdates } from "react-dom"
import { dispatch } from 'use-bus'
import { TimeChangedEvent, VariableChangedEvent } from "src/data/bus-events"

import { useImmer } from "use-immer"
import { setAutoFreeze } from "immer";
import { initPanelSettings } from "./plugins/panel/initSettings"

setAutoFreeze(false)
// All of the paths that is not defined in pages directory will redirect to this page,
// generally these pages are defined in:
// 1. team's side menu, asscessed by a specific url path
// 2. dashboard page, accessed by a dashboard id
export let variables: Variable[] = []
const DashboardWrapper = ({dashboardId}) => {
    const [dashboard, setDashboard] = useImmer<Dashboard>(null)
    const [timeRange, setTimeRange] = useState<TimeRange>(getInitTimeRange())
    const [gVariables, setGVariables] = useState<Variable[]>([])
    const [fullscreen, setFullscreen] = useState(false)
    
    useEffect(() => {
        load()

        return () => {
            for (const k in prevQueries) {
                delete prevQueries[k]
                delete prevQueryData[k]
            }
        }
    }, [])


    const load = async () => {
        const res = await requestApi.get(`/dashboard/byId/${dashboardId}`)
        const res0 = await requestApi.get(`/variable/all`)
        res.data.data.panels.forEach((panel:Panel) => {
            // console.log("33333 before",cloneDeep(panel.settings[panel.type]))
            panel.settings[panel.type] = defaultsDeep(panel.settings[panel.type], initPanelSettings[panel.type])
            // console.log("33333 after",cloneDeep(panel.settings[panel.type]),initPanelSettings[panel.type])
        })
        unstable_batchedUpdates(() => {
        setDashboard(cloneDeep(res.data))
        setGVariables(res0.data)
        setCombinedVariables(res0.data)
        })
    }


    // combine variables which defined separately in dashboard and global
    const setCombinedVariables = (gv?) => {
        const combined = concat(cloneDeep(dashboard?.data?.variables) ?? [], gv ?? gVariables)
        for (const v of combined) {
            v.values = v.value.split(",")
            // get the selected value for each variable from localStorage
        }
        setVariableSelected(combined)
        variables = combined
        dispatch(VariableChangedEvent)
    }



    useEffect(() => {
        setCombinedVariables()
    }, [dashboard?.data?.variables, gVariables])


    const onDashbardChange = useCallback( f => {
        setDashboard(f)
    },[])


    const visibleVars = variables.filter(v => {
        return !v.id.toString().startsWith("d-") && !find(dashboard?.data?.hidingVars?.split(','),v1 => v1 == v.name)
    })

    return (
        <>
            <PageContainer fullscreen={fullscreen}>
                {dashboard && <Box px="6px" width="100%">
                    <DashboardHeader fullscreen={fullscreen} dashboard={dashboard} onTimeChange={t => {dispatch({type:  TimeChangedEvent,data: t});setTimeRange(t)}} timeRange={timeRange}  onChange={onDashbardChange} />
                    <Box mt={fullscreen ? 0 : (visibleVars?.length > 0 ? "67px" : "38px")} py="2">
                        {dashboard.data.panels?.length > 0 && <DashboardGrid dashboard={dashboard} onChange={onDashbardChange} />}
                    </Box>
                </Box>}
            </PageContainer>
           
        </>
    )
}

export default DashboardWrapper



