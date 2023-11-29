// Copyright 2023 xObserve.io Team

import { $config } from 'src/data/configs/config'

export const nodeGraphData = (nodesCount, rand) => {
  const nodes = []
  const config = $config.get()
  for (let i = 0; i < nodesCount; i++) {
    const success = Math.round(Math.random() * 1000)
    const error = Math.round(Math.random() * 100)
    let node
    if (i == 0) {
      node = {
        id: 'web-xobserve-1',
        label: 'web-xobserve-1',
        data: {
          success: success,
          error: error,
        },
        icon: {
          show: true,
          img: null,
          text: `${success}\n${error}`,
        },
      }
    } else {
      node = {
        id: `fake-node-${i}`,
        label: `fake-node-${i}`,
        data: {
          success: success,
          error: error,
        },
        icon: {
          show: true,
          img:
            i % 5 === 4
              ? 'https://gw.alipayobjects.com/zos/bmw-prod/5d015065-8505-4e7a-baec-976f81e3c41d.svg'
              : null,
          text: i % 5 !== 4 ? `${success}\n${error}` : null,
        },
      }
    }

    nodes.push(node)
  }

  const edges = []

  const edgesSet = new Set()
  for (let i = 0; i < nodesCount; i++) {
    for (let j = 0; j < nodesCount; j++) {
      if (i !== j) {
        if (edgesSet.has(nodes[j].id + nodes[i].id)) {
          continue
        }
        if (Math.random() > rand) {
          const req = Math.round(Math.random() * 1000)
          const error = Math.round(Math.random() * 100)
          const duration = Math.round(Math.random() * 1000)
          edges.push({
            source: nodes[i].id,
            target: nodes[j].id,
            label: `${req} / ${error} / ${duration}ms`,
            data: {
              callsCount: req,
              success: req - error,
              error: error,
              p99: duration + 'ms',
            },
          })

          edgesSet.add(nodes[i].id + nodes[j].id)
        }
      }
    }
  }

  return { nodes, edges }
}
