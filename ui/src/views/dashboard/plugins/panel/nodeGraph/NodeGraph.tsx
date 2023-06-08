

import React, { useEffect, useLayoutEffect, useRef } from 'react';
import G6, { Graph } from '@antv/g6';
import { Box, useColorMode } from '@chakra-ui/react';
import { PanelProps } from 'types/dashboard';
import { initTooltip } from './tooltip';
import { initContextMenu } from './contextMenu';
import { donutColors } from './utils';
import { initLegend } from './legend';
import { setAttrsForData } from './transformData';

const NodeGrapPanel = ({ data }: PanelProps) => {
    const container = React.useRef(null);
    const graph = useRef<Graph>(null);
    const { colorMode } = useColorMode();
    const defaultNodeLabelCfg =  {
        position: 'bottom',
        style: {
            fill: colorMode == "light" ? '#000' : '#fff',
        }
    }

    useLayoutEffect(() => {
        if (graph.current) {
            console.log(data[0].nodes)
            data[0].nodes.forEach((node: any) => {
                if (!node.labelCfg) {
                    node.labelCfg = defaultNodeLabelCfg
                } else {
                    node.labelCfg.style.fill = colorMode == "light" ? '#000' : '#fff'
                }
            })

            graph.current.changeData()
            graph.current.render()
        }
    }, [colorMode])

    useLayoutEffect(() => {
        if (graph.current) {
            setAttrsForData(data[0])
            graph.current.changeData(data[0])
        }
    }, [data])

    useEffect(() => {
        if (!graph.current) {
            const tooltip = initTooltip()

            const contextMenu = initContextMenu()

            setAttrsForData(data[0])

            const legend = initLegend()

            graph.current = new G6.Graph({
                container: container.current,
                width: container.current.scrollWidth,
                height: container.current.scrollHeight,
                fitCenter: true,
                linkCenter: true,
                plugins: [legend, tooltip,contextMenu],
                modes: {
                    default: ['drag-node', 'activate-relations', 'drag-canvas', 'lasso-select', 'click-select'],
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
                        }
                    },
                    donutColorMap: donutColors,
                },
            });

            graph.current.data(data[0]);
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
                //@ts-ignore
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
        <Box width="100%" height="100%" ref={container} />
    </>;
}

const clearSelectedNodesState = graph => {
    const selectedNodes = graph.current.findAllByState('node', 'selected')
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


export default NodeGrapPanel

export const initNodeGraphSettings = {

}



