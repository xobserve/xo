import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import G6, { Graph } from '@antv/g6';
import { Box, useColorMode } from '@chakra-ui/react';
import { ColorModeSwitcher } from 'components/ColorModeSwitcher';

export default function () {
  const container = React.useRef(null);
  const graph = useRef<Graph>(null);
  const { colorMode } = useColorMode();
  useLayoutEffect(() => {
    if (graph.current) {
      data.nodes.forEach((node: any) => {
        node.labelCfg.style.fill = colorMode == "light" ? '#000' : '#fff'
      })
      graph.current.changeData()
    }
  }, [colorMode])


  useEffect(() => {
    if (!graph.current) {
      const tooltip = new G6.Tooltip({
        offsetX: 10,
        offsetY: 10,
        // the types of items that allow the tooltip show up
        // 允许出现 tooltip 的 item 类型
        itemTypes: ['node'],
        // custom the tooltip's content
        // 自定义 tooltip 内容
        getContent: (e) => {
          const outDiv = document.createElement('div');
          outDiv.style.width = 'fit-content';
          //outDiv.style.padding = '0px 0px 20px 0px';
          outDiv.innerHTML = `
            <h4>Custom Content</h4>
            <ul>
              <li>Type: ${e.item.getType()}</li>
            </ul>
            <ul>
              <li>Label: ${e.item.getModel().label || e.item.getModel().id}</li>
            </ul>`;
          return outDiv;
        },
      });

      const colors = {
        'success': '#61DDAA',
        'error': '#F08BB4',
      }

      // 计算 node size
      // 找出最小的那个作为基准 size
      let base;
      data.nodes.forEach((node: any, i) => {
        node.donutColorMap = colors;
        let t = 0;
        Object.keys(node.donutAttrs).forEach(key => {
          t += node.donutAttrs[key];
        })
        if (i == 0) {
          base = t
        } else {
          if (t < base) {
            base = t
          }
        }
      })

      // 根据与基准的比例，来计算大小
      data.nodes.forEach((node: any) => {
        console.log(node)
        let t = 0;
        Object.keys(node.donutAttrs).forEach(key => {
          t += node.donutAttrs[key];
        })

        const p = Math.log2(t / base)
        if (p <= 1) {
          node.size = 30
          node.icon.width = 15
          node.icon.height = 15
        } else if (p >= 3) {
          node.size = 90
          node.icon.width = 45
          node.icon.height = 45
        } else {
          node.size = p * 30
          node.icon.width = p * 15
          node.icon.height = p * 15
        }
      })


      const legendData = {
        nodes: [{
          id: 'success',
          label: 'Success',
          order: 0,
          style: {
            fill: colors['success'],
          }
        }, {
          id: 'rror',
          label: 'Error',
          order: 2,
          style: {
            fill: colors['error'],
          }
        }]
      }
      const legend = new G6.Legend({
        data: legendData,
        align: 'center',
        layout: 'horizontal', // vertical
        position: 'bottom-left',
        vertiSep: 12,
        horiSep: 24,
        offsetY: -24,
        padding: [4, 16, 8, 16],
        containerStyle: {
          fill: '#ccc',
          lineWidth: 0,
        },
        title: ' ',
        titleConfig: {
          offsetY: -8,
        },
      });


      const width = container.current.scrollWidth;
      const height = container.current.scrollHeight;
      graph.current = new G6.Graph({
        container: container.current,
        width,
        height,
        // translate the graph to align the canvas's center, support by v3.5.1
        fitCenter: true,
        linkCenter: true,
        plugins: [legend, tooltip],
        // 设置为true，启用 redo & undo 栈功能
        enabledStack: true,
        modes: {
          default: ['drag-node', 'zoom-canvas', 'activate-relations','drag-canvas','lasso-select','click-select'],
        },
        layout: {
          type: 'radial',
          focusNode: 'li',
          linkDistance: 150,
          unitRadius: 200,
          preventNodeOverlap: true
        },
        defaultEdge: {
          type: 'quadratic',
          style: {
            endArrow: true,
            lineAppendWidth: 2,
            opacity: 1,
          },
          labelCfg: {
            autoRotate: true,
            style: {
              stroke: "#fff",
              lineWidth: 5
            }
          },
        },
        defaultNode: {
          type: 'donut',
          style: {
            lineWidth: 0,
          },
          labelCfg: {
            position: 'bottom',
            style: {
              fill: colorMode == "light" ? '#000' : '#fff',
              // background: {
              //   fill: '#fff',
              //   // stroke: '#9EC9FF',
              //   padding: [2, 2, 2, 2],
              //   radius: 2,
              // },
            }
          },
        },
      });

      graph.current.data(data);
      graph.current.render();
      graph.current.on('node:mouseenter', (evt) => {
        const { item } = evt;
        graph.current.setItemState(item, 'active', true);
      });

      graph.current.on('node:mouseleave', (evt) => {
        const { item } = evt;
        graph.current.setItemState(item, 'active', false);
      });

      graph.current.on('node:click', (evt) => {
        const { item } = evt;
        graph.current.setItemState(item, 'selected', true);
      })

      graph.current.on('node:dblclick', (evt) => {
        clearSelectedNodesState(graph)
        clearSelectedEdgesState(graph)

        const { item } = evt;
        graph.current.setItemState(item, 'selected', true);
        item.getEdges().forEach(edge => {
          graph.current.setItemState(edge, 'selected', true);
        })
        // graph.current.setItemState(item, 'focus', true);
      });
      graph.current.on('canvas:click', (evt) => {
        clearSelectedNodesState(graph)
        clearSelectedEdgesState(graph)
      });
    }
  }, []);

  return <>
    <Box width="100vw" height="95vh" ref={container}></Box>
    <ColorModeSwitcher />
  </>;
}

const clearSelectedNodesState = graph => {
  const selectedNodes = graph.current.findAllByState('node','selected')
  selectedNodes.forEach(node => {
    graph.current.setItemState(node, 'selected', false)
  })
}

const clearSelectedEdgesState = graph => {
  const selectedEdges = graph.current.findAllByState('edge', 'selected')
  selectedEdges.forEach(edge => {
    graph.current.clearItemStates(edge)
  })
}

const data = {
  nodes: [
    {
      id: 'A',
      label: 'Service A',
      // the attributes for drawing donut
      donutAttrs: {
        'success': 1000,
        'error': 300,
      },
      icon: {
        show: true,
        width: 20,
        height: 20,
        //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
      }
    },
    {
      id: 'B',
      label: 'Service B',
      donutAttrs: {
        'success': 500,
        'error': 500,
      },
      icon: {
        show: true,
        width: 20,
        height: 20,
        //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
      }
    },
    {
      id: 'C',
      label: 'Service C',
      donutAttrs: {
        'success': 400,
        'error': 0,
      },
      icon: {
        show: true,
        width: 20,
        height: 20,
        //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
      }
    },
    {
      id: 'D',
      label: 'Service D',
      donutAttrs: {
        'success': 700,
        'error': 1000,
      },
      icon: {
        show: true,
        width: 20,
        height: 20,
        //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
      }
    },
    {
      id: 'E',
      label: 'Service E',
      donutAttrs: {
        'success': 800,
        'error': 0,
      },
      icon: {
        show: true,
        width: 20,
        height: 20,
        //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
      }
    },
    {
      id: 'F',
      label: 'Service F',
      donutAttrs: {
        'success': 20000,
        'error': 5,
      },
      icon: {
        show: true,
        width: 20,
        height: 20,
        //  img: 'https://gw.alipayobjects.com/zos/basement_prod/012bcf4f-423b-4922-8c24-32a89f8c41ce.svg',
      }
    },
  ],
  edges: [
    { source: 'C', target: 'F', label: '30' },
    { source: 'B', target: 'A', label: '60' },
    { source: 'D', target: 'E', label: '80' },
    { source: 'D', target: 'C', label: '20' },
    { source: 'B', target: 'C', label: '100' },
    { source: 'A', target: 'C', label: '32' },
    { source: 'C', target: 'A', label: '45' },
    { source: 'F', target: 'F', label: '45' },
  ]
};
