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
import { DatasourceType, Panel, PanelDatasource, PanelType } from "types/dashboard";
import { initPanelPlugins } from "./initPlugins";
import { initPanelStyles } from "./initStyles";
import { DatasourceMaxDataPoints, DatasourceMinInterval, InitTestDataDatasourceId } from "../constants";

export const initPanel = (id?) => {
    const type = PanelType.Text
    const p: Panel = {
        desc: "",
        collapsed: false,
        type: type,
        gridPos: { x: 0, y: 0, w: 13, h: 20 },
        plugins: {
            [type]: initPanelPlugins[type]
        },
        datasource: initDatasource,
        styles: initPanelStyles,
        overrides: [],
        transform:
            `function transform(data) {
    console.log("panel data to be transformed:",data)
    return data
}`,
        enableTransform: true,
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
            legend: "",
            visible: true,
            data: {}
        }
    ]
}