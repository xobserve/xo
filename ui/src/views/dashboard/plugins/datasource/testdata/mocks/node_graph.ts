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

export const nodeGraphData = (nodesCount, rand) => {
    const nodes = [];
    for (let i = 0; i < nodesCount; i++) {
      const success =  Math.round(Math.random() * 1000)
      const error = Math.round(Math.random() * 100)
      const node: any = {
        id: `node-${i}`,
        label: `node-${i}`,
        data: {
          success: success,
          error: error
        },
        icon: {
          show: true,
          img : i % 5 === 4 ?  'https://gw.alipayobjects.com/zos/bmw-prod/5d015065-8505-4e7a-baec-976f81e3c41d.svg' : null,
          text:  i % 5 !== 4 ? `${success}\n${error}` : null
        }
      }
      nodes.push(node)
    }

    const edges = []
    
    const edgesSet = new Set()
    for (let i = 0; i < nodesCount; i++) {
      for (let j = 0; j < nodesCount; j++) {
        if (i !== j) {
          if (edgesSet.has(`node-${j}` + `node-${i}`)) {
             continue 
          }
          if (Math.random() > rand) {
            const req = Math.round(Math.random() * 1000)
            const error = Math.round(Math.random() * 100)
            edges.push({
              source: `node-${i}`,
              target: `node-${j}`,
              label:  `${req} / ${error}`,
              data: {
                req: req,
                error: error,
              },
            })

            edgesSet.add(`node-${i}` + `node-${j}`)
          }
        }
      }
    }

    return {nodes,edges}
}