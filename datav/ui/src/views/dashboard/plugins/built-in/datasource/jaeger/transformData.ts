// Copyright 2023 xObserve.io Team

import { Panel, PanelQuery } from 'types/dashboard'
import { TimeRange } from 'types/time'
import { nodeGraphDataToSeries } from '../../panel/nodeGraph/transformData'
import { PanelTypeNodeGraph } from '../../panel/nodeGraph/types'
import { PanelTypeTable } from '../../panel/table/types'

export const jaegerToPanels = (
  rawData: any[],
  panel: Panel,
  query: PanelQuery,
  range: TimeRange,
) => {
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
const jaegerToNodeGraphData = (rawData: any[], query: PanelQuery) => {
  const data = {
    nodes: [],
    edges: [],
  }

  rawData.forEach((item, i) => {
    if (query.data.showServices.length > 0) {
      if (
        !query.data.showServices.includes(item.parent) &&
        !query.data.showServices.includes(item.child)
      ) {
        return
      }
    }
    data.nodes.find((n) => n.id == item.parent) ||
      data.nodes.push({
        id: item.parent,
        label: item.parent,
        data: {
          success: 0,
        },
      })

    const child = data.nodes.find((n) => n.id == item.child)
    if (!child) {
      data.nodes.push({
        id: item.child,
        label: item.child,
        data: {
          success: item.callCount,
        },
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
      },
    })

    data.nodes.forEach((n) => {
      n.icon = {
        show: true,
        text: `${n.data.success}`,
      }
    })
  })

  return data
}
