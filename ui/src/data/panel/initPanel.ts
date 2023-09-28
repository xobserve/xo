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
import { Panel, PanelDatasource, PanelType } from "types/dashboard";
import { initPanelPlugins } from "./initPlugins";
import { initPanelStyles } from "./initStyles";
import { DatasourceMaxDataPoints, DatasourceMinInterval, InitTestDataDatasourceId } from "../constants";

export const initPanelType = PanelType.Graph
export const initPanel = (id?) => {
    const p: Panel = {
        desc: "",
        collapsed: false,
        type: initPanelType,
        gridPos: { x: 0, y: 0, w: 12, h: 20 },
        plugins: {
            [initPanelType]: initPanelPlugins()[initPanelType]
        },
        datasource: initDatasource,
        styles: initPanelStyles,
        overrides: [],
        valueMapping: null,
        transform: `function transform(rawData,lodash, moment) {
    // for demonstration purpose: how to use 'moment'
    // const t = moment(new Date()).format("YY-MM-DD HH:mm::ss")
    return rawData
}`,
        enableTransform: false,
        enableConditionRender: false,
        conditionRender: {
            type: "variable",
            value: ""
        }
    }

    if (id) {
        p.id = id,
            p.title = `New panel ${id}`
    }

    return p
}


export const initRowPanel = (id) => {
    const p  = {
        id: id,
        title: "New row",
        desc: "",
        collapsed: false,
        type: PanelType.Row,
        gridPos: { x: 0, y: 0, w: 24, h: 1.5 },
    }

    return p
}

export const initDatasource: PanelDatasource = {
    id: InitTestDataDatasourceId,
    queryOptions: {
        minInterval: DatasourceMinInterval,
        maxDataPoints: DatasourceMaxDataPoints
    },
    queries: [
        {
            id: 65,
            metrics: "",
            legend: "",
            visible: true,
            data: {}
        }
    ]
}