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

import { FilterCombinition, FilterOperator } from './Filter'

export const filterNodes = (graph, rules) => {
  const nodes = graph.getNodes()
  const hiddenNodes = []
  const showNodes = []
  nodes.forEach((n) => {
    const model = n.getModel()
    let passed = true
    let isFirst = true
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      if (rule.disabled || rule.type != 'node') {
        continue
      }

      let stepPassed = true
      if (rule.key == 'label') {
        if ((model.label as string).match(rule.value) == null) {
          stepPassed = false
        }
      } else {
        const v = model.data[rule.key]
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

    if (!passed) {
      hiddenNodes.push(n)
    } else {
      showNodes.push(n)
    }
  })
  hiddenNodes.forEach((n) => {
    graph.hideItem(n)
  })
  showNodes.forEach((n) => {
    graph.showItem(n)
  })
}
