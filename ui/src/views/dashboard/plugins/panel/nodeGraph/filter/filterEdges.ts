import { Graph } from "@antv/g6"
import { FilterCombinition, FilterOperator } from "./Filter"

export const filterEdges = (graph: Graph, rules) => {
    const rawEdges = graph.getEdges()
    const edges = []
    rawEdges.forEach(edge => {
        if (edge.isVisible()) {
            edges.push(edge)
        }
    })

    const hiddenEdges = []
    edges.forEach(edge => {
        const model = edge.getModel()
        let passed = true;
        let isFirst = true;
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i]
            if (rule.disabled || rule.type != 'edge') {
                continue
            }

            let stepPassed = true
            const v = model.data[rule.key]
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

        if (!passed) {
            hiddenEdges.push(edge)
        }
    })


    hiddenEdges.forEach(n => {
        graph.hideItem(n)
    })
}