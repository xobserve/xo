
export const nodeGraphData = (nodesCount) => {
    const nodes = [];
    for (let i = 0; i < nodesCount; i++) {
      nodes.push({
        id: `node-${i}`,
        label: `node-${i}`,
        data: {
          success: Math.random() * 1000,
          error: Math.random() * 100,
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
          if (Math.random() > 0.85) {
            edges.push({
              source: `node-${i}`,
              target: `node-${j}`,
              label:  Math.round(Math.random() * 1000),
              data: {
                req: Math.random() * 1000,
                error: Math.random() * 100,
              },
            })
          }
        }
      }
    }

    return {nodes,edges}
}