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
import { Panel, PanelDatasource, PanelTypeRow } from "types/dashboard";
import { initPanelStyles } from "./initStyles";
import { DatasourceMaxDataPoints, DatasourceMinInterval } from "../constants";
import { builtinPanelPlugins } from "src/views/dashboard/plugins/built-in/plugins";
import { externalPanelPlugins } from "src/views/dashboard/plugins/external/plugins";
import { PanelTypeGraph } from "src/views/dashboard/plugins/built-in/panel/graph/types";
import { $datasources } from "src/views/datasource/store";
import { DatasourceTypeTestData } from "src/views/dashboard/plugins/built-in/datasource/testdata/types";
import { first } from "lodash";

export const initPanelType = PanelTypeGraph
export const initPanel = (id?) => {
    const plugin = builtinPanelPlugins[initPanelType] ?? externalPanelPlugins[initPanelType]
    const p: Panel = {
        desc: "",
        collapsed: false,
        type: initPanelType,
        gridPos: { x: 0, y: 0, w: 12, h: 20 },
        plugins: {
            [initPanelType]: plugin.settings.initOptions
        },
        datasource: initDatasource(),
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
        },
        enableScopeTime: false,
        scopeTime: null
    }

    if (id) {
        p.id = id
        p.title = `New panel ${id}`
    }

    return p
}


export const initRowPanel = (id) => {
    const p = {
        id: id,
        title: "New row",
        desc: "",
        collapsed: false,
        type: PanelTypeRow,
        gridPos: { x: 0, y: 0, w: 24, h: 1.5 },
    }

    return p
}

export const initDatasource = () => {
    return {
        id: $datasources.get().find(ds => ds.type == DatasourceTypeTestData)?.id ?? first($datasources.get())?.id,
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
} 