import { Box, Button, Modal, ModalBody, ModalContent, ModalOverlay, useDisclosure, VStack } from "@chakra-ui/react"
import { PanelAdd } from "components/icons/PanelAdd"
import PageContainer from "layouts/page-container"
import { useRouter } from "next/router"
import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { Dashboard, DatasourceType, Panel, PanelType } from "types/dashboard"
import { requestApi } from "utils/axios/request"
import { Team } from "types/teams"
import DashboardHeader from "components/dashboard/DashboardHeader"
import DashboardGrid from "components/dashboard/grid/DashboardGrid"
import { cloneDeep, concat, has, isEqual } from "lodash"
import { TimeRange } from "types/time"
import { getInitTimeRange, initTimeRange } from "components/TimePicker"
import { Variable } from "types/variable"
import { setVariableSelected } from "components/variables/SelectVariables"
import { prevQueries, prevQueryData } from "components/dashboard/grid/PanelGrid"
import { useLeavePageConfirm } from "hooks/useLeavePage"
import { unstable_batchedUpdates } from "react-dom"
import storage from "utils/localStorage"
import { StorageCopiedPanelKey } from "src/data/constants"
import { dispatch } from 'use-bus'
import { TimeChangedEvent, VariableChangedEvent } from "src/data/bus-events"

// All of the paths that is not defined in pages directory will redirect to this page,
// generally these pages are defined in:
// 1. team's side menu, asscessed by a specific url path
// 2. dashboard page, accessed by a dashboard id
export let variables: Variable[] = []
const DashboardWrapper = ({dashboardId}) => {
    const [dashboard, setDashboard] = useState<Dashboard>(null)
    const [timeRange, setTimeRange] = useState<TimeRange>(getInitTimeRange())
    const [gVariables, setGVariables] = useState<Variable[]>([])
    const [pageChanged, setPageChanged] = useState(false)
    const [savedDashboard, setSavedDashboard] = useState<Dashboard>(null)

    useLeavePageConfirm(pageChanged)
    
    
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
        unstable_batchedUpdates(() => {
        setDashboard(res.data)
        setSavedDashboard(cloneDeep(res.data))
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
        setTimeout(() => dispatch(VariableChangedEvent), 100)
      
    }

    const getNextPanelId = () => {
        let max = 0;

        for (const panel of dashboard.data.panels) {
            if (panel.id > max) {
                max = panel.id;
            }
        }

        return max + 1;
    }


    const onAddPanel = () => {
         // Return if the "Add panel" exists already
        // if (panel) {
        //     return;
        // }

        if (!dashboard.data.panels) {
            dashboard.data.panels = []
        }
        const id = getNextPanelId()
        const newPanel: Panel = {
            id: id,
            title: `New panel ${id}`,
            type: PanelType.Text,
            gridPos: { x: 0, y: 0, w: 12, h: 8 },
            settings: {
                text: {
                    md: `#Welcome to Starship\n This is a new panel\n You can edit it by clicking the edit button on the top title\n ###Have fun!`
                },
            },
            datasource: [{
                type: DatasourceType.Prometheus,
                selected: true,
                queryOptions: {
                    interval: '15s'
                },
                queries: []
            }],
            useDatasource: false,
            showBorder: true
        }

        dashboard.data.panels.unshift(newPanel);

        // // panel in editing must be a clone of the original panel
        // setPanel(cloneDeep(newPanel))

        // scroll to top after adding panel
        window.scrollTo(0, 0);

        setDashboard(cloneDeep(dashboard))
        onDashboardChanged()
    }
    const onGridChange = useCallback((panel: Panel) => {
        console.log("11111112:")
        setDashboard(d => cloneDeep(d))
        // onDashboardChanged()
    },[])


    useEffect(() => {
        setCombinedVariables()
    }, [dashboard?.data?.variables, gVariables])

    const onDashboardChange = useCallback(() => {
        setDashboard(d => cloneDeep(d))
        onDashboardChanged()
    },[])


    const onDashboardChanged = useCallback(() => {
        // console.log("1111111changed:", JSON.stringify(dashboard),JSON.stringify(savedDashboard),!isEqual(dashboard, savedDashboard))
        setPageChanged(!isEqual(dashboard, savedDashboard))
    },[dashboard])

    const onDashboardSave = useCallback(() => {
        const d = cloneDeep(dashboard)
        unstable_batchedUpdates(() => {
            setSavedDashboard(d)
            setPageChanged(false)
        })

    },[dashboard])

    const onPastePanel = () => {
        const copiedPanel = storage.get(StorageCopiedPanelKey)
        storage.remove(StorageCopiedPanelKey)
        if (copiedPanel) {
            const id = getNextPanelId()
            copiedPanel.id = id
            dashboard.data.panels.unshift(copiedPanel);
            onDashboardChanged()
            return 
        }
    }

    console.log("1111111:",cloneDeep(dashboard))
    return (
        <>
            <PageContainer>
                {dashboard && <Box px="3" width="100%">
                    <DashboardHeader dashboard={dashboard}  onAddPanel={onAddPanel} onTimeChange={t => {dispatch({type:  TimeChangedEvent,data: t});setTimeRange(t)}} timeRange={timeRange} onVariablesChange={null} onChange={onDashboardChange} onDashboardSave={onDashboardSave} onPastePanel={onPastePanel}/>
                    <Box mt={variables?.length > 0 ? "80px" : "50px"} py="2">
                        {dashboard.data.panels?.length > 0 && <DashboardGrid dashboard={dashboard} onChange={onGridChange} variables={variables} onDashbardChanged={onDashboardChanged} onVariablesChange={null} />}
                    </Box>
                </Box>}
            </PageContainer>
           
        </>
    )
}

export default DashboardWrapper



