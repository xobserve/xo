import { DatasourceType, PanelSettings, PanelType } from "types/dashboard";
import { initPanelSettings } from "./initPlugins";
import { initPanelStyles } from "./initStyles";

export const initPanel = (id?) =>  {
    const p: any = {
        type: PanelType.Text,
        gridPos: { x: 0, y: 0, w: 12, h: 8 },
        settings:initPanelSettings,
        datasource: [{
            type: DatasourceType.Prometheus,
            selected: true,
            queryOptions: {
                interval: '15s'
            },
            queries: []
        }],
        useDatasource: false,
        styles: initPanelStyles
    }

    if (id) {
        p.id = id,
        p.title = `New panel ${id}`
    }

    return p
} 


