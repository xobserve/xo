import { DatasourceType, Panel, PanelDatasource, PanelType } from "types/dashboard";
import { initPanelPlugins } from "./initPlugins";
import { initPanelStyles } from "./initStyles";
import { DatasourceMaxDataPoints, DatasourceMinInterval, InitTestDataDatasourceId } from "../constants";

export const initPanel = (id?) =>  {
    const type = PanelType.Text
    const p: Panel = {
        desc: "",
        collapsed: false,
        type: type,
        gridPos: { x: 0, y: 0, w: 12, h: 8 },
        plugins:  {
            [type]:initPanelPlugins[type]
        },
        datasource: initDatasource,
        styles: initPanelStyles
    }

    if (id) {
        p.id = id,
        p.title = `New panel ${id}`
    }

    return p
} 


export const initDatasource: PanelDatasource = {
    id: InitTestDataDatasourceId,
    type: DatasourceType.TestData,
    queryOptions: {
        minInterval: DatasourceMinInterval,
        maxDataPoints: DatasourceMaxDataPoints
    },
    queries: [
        {
            id: 65,
            metrics: "",
            legend: "" ,
            visible: true
        }
    ]
}