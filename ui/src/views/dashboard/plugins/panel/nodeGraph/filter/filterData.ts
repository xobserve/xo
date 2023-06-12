import { Graph } from "@antv/g6"
import { PanelData } from "types/dashboard"
import storage from "utils/localStorage"
import { FilterCombinition, FilteringStorageKey, FilterOperator } from "./Filter"


export const filterData = (data,dashboardId, panelId,rs?) => {
    const {nodes,edges} = data
    const rules = rs??storage.get(FilteringStorageKey + dashboardId + '-' + panelId)
    if (!rules) {
         return data
    }
    const ns = filterNodes(nodes,rules)
    const es = filterEdges(edges,rules)
    return {
        nodes: ns,
        edges: es
    } as PanelData
}

const filterEdges = (edges, rules) => {
    return edges.filter(edge => {
        let passed = true;
        let isFirst = true;
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
                    break;
                case FilterOperator.LowerThan:
                    stepPassed = v < rule.value
                    break;
                case FilterOperator.Equal:
                    stepPassed = v == rule.value
                    break;
                case FilterOperator.Regex:
                    stepPassed = ((v as string).match(rule.value) != null)
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
    return nodes.filter(n => {
        let passed = true;
        let isFirst = true;
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i]
            if (rule.disabled || rule.type != 'node') {
                continue
            }

            let stepPassed = true
            if (rule.key == 'label') {
                if (((n.label as string).match(rule.value) == null)) {
                    stepPassed = false
                }
            } else {
                const v = n.data[rule.key]
                switch (rule.operator) {
                    case FilterOperator.GreaterThan:
                        stepPassed = v > rule.value
                        break;
                    case FilterOperator.LowerThan:
                        stepPassed = v < rule.value
                        break;
                    case FilterOperator.Equal:
                        stepPassed = v == rule.value
                        break;
                    case FilterOperator.Regex:
                        stepPassed = ((v as string).match(rule.value) != null)
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