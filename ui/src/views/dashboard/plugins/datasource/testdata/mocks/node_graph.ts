
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
        }
      }
      if (i % 5 == 1) {
        node.data.type = 'java'
      } else if (i % 5 == 2) {
        node.data.type = 'go'
      } else if (i % 5 == 3) {
      } else if (i % 5 == 4) {
        node.data.type = 'rust'
        node.icon = {
          show: true,
          img: 'https://gw.alipayobjects.com/zos/bmw-prod/5d015065-8505-4e7a-baec-976f81e3c41d.svg',
        }
      }

      if (!node.icon?.img) {
        node.icon = {
          show: true,
          text: `${success}\n${error}`
        }
      }
      nodes.push(node)
      console.log("here33333",nodes)
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