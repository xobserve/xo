
export const nodeGraphData = (nodesCount) => {
    const nodes = [];
    for (let i = 0; i < nodesCount; i++) {
      nodes.push({
        id: `node-${i}`,
        label: `node-${i}`,
        data: {
          success: Math.round(Math.random() * 1000),
          error: Math.round(Math.random() * 100),
        },
        icon: {
          show: false,
          width: 20,
          height: 20,
          //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
        }
      })
    }

    const edges = []

    for (let i = 0; i < nodesCount; i++) {
      for (let j = 0; j < nodesCount; j++) {
        if (i !== j) {
          if (Math.random() > 0.8) {
            const req = Math.round(Math.random() * 1000)
            const error = Math.round(Math.random() * 100)
            edges.push({
              source: `node-${i}`,
              target: `node-${j}`,
              label:  `${req}/${error}`,
              data: {
                req: req,
                error: error,
              },
            })
          }
        }
      }
    }

    return {nodes,edges}
}