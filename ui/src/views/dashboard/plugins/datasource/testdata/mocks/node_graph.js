
export const nodeGraphData = (nodesCount) => {
    const nodes = [];
    for (let i = 0; i < nodesCount; i++) {
      const node = {
        id: `node-${i}`,
        label: `node-${i}`,
        data: {
          success: Math.round(Math.random() * 1000),
          error: Math.round(Math.random() * 100),
        }
      }
      if (i % 5 == 1) {
        node.data.type = 'java'
      } else if (i % 5 == 2) {
        node.data.type = 'go'
      } else if (i % 5 == 3) {
        node.icon = {
          show: true,
          //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
        }
      } else if (i % 5 == 4) {
        node.data.type = 'rust'
        node.icon = {
          show: true,
          //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
        }
      }

      nodes.push(node)
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