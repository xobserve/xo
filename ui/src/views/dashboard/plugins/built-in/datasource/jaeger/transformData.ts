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
import { isEmpty } from "lodash"
import { Panel, PanelQuery } from "types/dashboard"
import { NodeGraphPluginData } from "types/plugins/nodeGraph"
import { TimeRange } from "types/time"
import { nodeGraphDataToSeries } from "../../panel/nodeGraph/transformData"
import { PanelTypeNodeGraph } from "../../panel/nodeGraph/types"
import { PanelTypeTable } from "../../panel/table/types"

export const jaegerToPanels = (rawData: any[], panel: Panel, query: PanelQuery, range: TimeRange) => {
    if (rawData.length == 0) {
        return null
    }

    switch (panel.type) {
        case PanelTypeNodeGraph:
            return jaegerToNodeGraphData(rawData, query)
        case PanelTypeTable:
            const data = jaegerToNodeGraphData(rawData, query)
            return nodeGraphDataToSeries(data)
        default:
            return null
    }
}




// 0 
// {parent: "frontend", child: "driver", callCount: 11}
// 1
// : 
// {parent: "customer", child: "mysql", callCount: 11}
// 2
// : 
// {parent: "driver", child: "redis", callCount: 149}
// 3
// : 
// {parent: "frontend", child: "route", callCount: 110}
// 4
// : 
// // {parent: "frontend", child: "customer", callCount: 11}
// {
//     id: `node-${i}`,
//     label: `node-${i}`,
//     data: {
//       success: Math.round(Math.random() * 1000),
//       error: Math.round(Math.random() * 100),
//     }
//   }
// {
//     source: `node-${i}`,
//     target: `node-${j}`,
//     label:  `${req}/${error}`,
//     data: {
//       req: req,
//       error: error,
//     },
//   })
// }
const jaegerToNodeGraphData = (rawData: any[], query: PanelQuery):NodeGraphPluginData => {
    const data: NodeGraphPluginData = {
        nodes: [],
        edges: []
    }

    
    rawData.forEach((item, i) => {
        if (query.data.showServices.length > 0) {
            if (!query.data.showServices.includes(item.parent) && !query.data.showServices.includes(item.child)) {
                return
            }
        }
        data.nodes.find(n => n.id == item.parent) || data.nodes.push({
            id: item.parent,
            label: item.parent,
            data: {
                success: 0,
            }
        })

        const child = data.nodes.find(n => n.id == item.child)
        if (!child) {
            data.nodes.push({
                id: item.child,
                label: item.child,
                data: {
                    success: item.callCount,
                }
            })
        } else {
            child.data.success += item.callCount
        }

        data.edges.push({
            source: item.parent,
            target: item.child,
            label: `${item.callCount}`,
            data: {
                success: item.callCount,
            }
        })

        data.nodes.forEach(n => {
            n.icon =  {
                show: true,
                text:  `${n.data.success}`
              }
        })
    })

    return data
}