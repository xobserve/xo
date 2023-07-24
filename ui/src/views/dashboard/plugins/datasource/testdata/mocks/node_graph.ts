
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