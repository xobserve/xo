// Copyright 2023 xobserve.io Team
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

import { isEmpty } from 'lodash'
import { PanelData } from 'types/dashboard'
import storage from 'utils/localStorage'
import {
  FilterCombinition,
  FilteringRelationKey,
  FilteringStorageKey,
  FilterOperator,
} from './Filter'

export const filterData = (data, dashboardId, panelId, rs?) => {
  const { nodes, edges } = data
  const rules =
    rs ?? storage.get(FilteringStorageKey + dashboardId + '-' + panelId)
  if (isEmpty(rules)) {
    return data
  }
  console.time('filter data in node graph, time used:')
  const ns = filterNodes(nodes, rules)
  const es = filterEdges(edges, rules)

  if (ns.length != nodes.length) {
    const relation = storage.get(
      FilteringRelationKey + dashboardId + '-' + panelId,
    )
    if (relation) {
      const relationMap = new Map()
      edges.forEach((edge) => {
        const oldS = relationMap[edge.source]
        if (!oldS) {
          relationMap[edge.source] = [edge.target]
        } else {
          oldS.push(edge.target)
        }

        const oldT = relationMap[edge.target]
        if (!oldT) {
          relationMap[edge.target] = [edge.source]
        } else {
          oldT.push(edge.source)
        }
      })
      // find the relations of the results
      const extraNodes = []
      for (const node of ns) {
        const relations = relationMap[node.id]
        relations?.forEach((id) => {
          if (!extraNodes.includes(id)) {
            extraNodes.push(id)
          }
        })
      }

      for (const id of extraNodes) {
        const node = nodes.find((n) => n.id == id)
        ns.push(node)
      }
    }
  }

  console.timeEnd('filter data in node graph, time used:')
  return {
    nodes: ns,
    edges: es,
  } as PanelData
}

const filterEdges = (edges, rules) => {
  return edges.filter((edge) => {
    let passed = true
    let isFirst = true
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      if (rule.disabled || rule.type != 'edge') {
        continue
      }

      let stepPassed = true
      const v = edge.data[rule.key]
      switch (rule.operator) {
        case FilterOperator.GreaterThan:
          stepPassed = v > rule.value
          break
        case FilterOperator.LowerThan:
          stepPassed = v < rule.value
          break
        case FilterOperator.Equal:
          stepPassed = v == rule.value
          break
        case FilterOperator.Regex:
          stepPassed = (v as string).match(rule.value) != null
          break
      }
      if (isFirst) {
        // first condition defaults to AND
        passed = passed && stepPassed
      } else {
        if (rule.combination == FilterCombinition.And) {
          passed = passed && stepPassed
        } else {
          passed = passed || stepPassed
        }
      }

      // set isFirst to false after first loop
      if (isFirst) {
        isFirst = false
      }
    }

    return passed
  })
}

const filterNodes = (nodes, rules) => {
  return nodes.filter((n) => {
    let passed = true
    let isFirst = true
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      if (rule.disabled || rule.type != 'node') {
        continue
      }

      let stepPassed = true
      if (rule.key == 'label') {
        if ((n.label as string).match(rule.value) == null) {
          stepPassed = false
        }
      } else {
        const v = n.data[rule.key]
        switch (rule.operator) {
          case FilterOperator.GreaterThan:
            stepPassed = v > rule.value
            break
          case FilterOperator.LowerThan:
            stepPassed = v < rule.value
            break
          case FilterOperator.Equal:
            stepPassed = v == rule.value
            break
          case FilterOperator.Regex:
            stepPassed = (v as string).match(rule.value) != null
            break
        }
      }

      if (isFirst) {
        // first condition defaults to AND
        passed = passed && stepPassed
      } else {
        if (rule.combination == FilterCombinition.And) {
          passed = passed && stepPassed
        } else {
          passed = passed || stepPassed
        }
      }

      // set isFirst to false after first loop
      if (isFirst) {
        isFirst = false
      }
    }

    return passed
  })
}
