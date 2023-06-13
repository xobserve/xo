

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import G6, { Graph } from '@antv/g6';
import { Box, Text, useColorMode } from '@chakra-ui/react';
import { PanelData, PanelProps } from 'types/dashboard';
import { initTooltip } from './tooltip';
import { donutDarkColors, donutLightColors } from './default-styles';
import { initLegend } from './legend';
import { setAttrsForData } from './transformData';
import { NodeGraphToolbar } from './Toolbar';
import Help from 'components/help';
import { nodeGraphHelp } from './data/help';
import useContextMenu from './useContextMenu';
import HiddenItems from './HiddenItem';
import { filterData } from './filter/filterData';
import { getDefaultEdgeLabel, getDefaultEdgeStyle, getDefaultNodeLabel, getDefaultNodeStyle } from './default-styles';
import { merge } from 'lodash';




const NodeGrapPanel = ({ data, panel, dashboardId }: PanelProps) => {
    const container = React.useRef(null);
    const [graph, setGraph] = useState<Graph>(null);
    const { colorMode } = useColorMode();
    const defaultNodeLabelCfg = getDefaultNodeLabel(colorMode)
    const defaultEdgeLabelCfg = getDefaultEdgeLabel(colorMode)
    const [selected, setSelected] = useState(false)
    const contextMenu = useContextMenu()

    useEffect(() => {
        if (graph) {
            onColorModeChange(graph,data,colorMode,dashboardId,panel.id)
        }
    }, [colorMode])

    useEffect(() => {
        if (graph) {
            setAttrsForData(data[0])
            const newData = filterData(data[0], dashboardId, panel.id)
            if (newData != data[0]) {
                graph.data(newData)
                graph.render()
            } else {
                graph.changeData(newData)
            }
        }
    }, [data])

    const onFilterRulesChange = (rules?) => {
        const newData = filterData(data[0], dashboardId, panel.id, rules)
        if (newData != data[0]) {
            graph.data(newData)
            graph.render()
        } else {
            graph.changeData(newData)
        }
    }

    useEffect(() => {
        if (!graph) {
            const tooltip = initTooltip()

            setAttrsForData(data[0])

            const legend = initLegend()

            const gh = new G6.Graph({
                container: container.current,
                width: container.current.scrollWidth,
                height: container.current.scrollHeight,
                // fitView: true,
                fitCenter: true,
                fitView: true,
                fitViewPadding: 16,
                plugins: [legend, tooltip, contextMenu],
                modes: {
                    default: ['drag-node', 'activate-relations', 'drag-canvas', 'click-select', {
                        type: 'lasso-select',
                        onSelect(nodes, edges) {
                            setSelected(true)
                        }
                    }],
                    fisheyeMode: []
                },
                layout: {
                    type: 'force2',
                    // focusNode: 'li',
                    linkDistance: 500,
                    // unitRadius: 200,
                    preventNodeOverlap: true,
                },
                defaultEdge: {
                    type: 'quadratic',
                    style: {
                        endArrow: true,
                        lineAppendWidth: 2,
                        opacity: 1,
                        stroke: colorMode == "light" ? '#ddd' : '#444'
                    },
                    labelCfg: defaultEdgeLabelCfg,
                    stateStyles: {
                      
                    }
                },
                defaultNode: {
                    type: 'donut',
                    style: {
                        lineWidth: 0,
                        fill: 'transparent',
                    },
                    labelCfg: defaultNodeLabelCfg,
                    donutColorMap: colorMode == "light" ? donutLightColors : donutDarkColors,
                    stateStyles: {
                    }
                },
                nodeStateStyles: getDefaultNodeStyle(colorMode),
                edgeStateStyles: getDefaultEdgeStyle(colorMode),
            });

            const g1 = gh
            g1.on('node:mouseenter', (evt) => {
                const { item } = evt;
                g1.setItemState(item, 'active', true);
            });

            g1.on('node:mouseleave', (evt) => {
                const { item } = evt;
                g1.setItemState(item, 'active', false);
            });

            g1.on('node:click', (evt) => {
                const { item } = evt;
                console.log(g1, item)
                g1.setItemState(item, 'selected', true);
                setSelected(true)
            })

            g1.on('node:dblclick', (evt) => {
                clearSelectedNodesState(g1)
                clearSelectedEdgesState(g1)

                const { item } = evt;
                g1.setItemState(item, 'selected', true);
                //@ts-ignore
                item.getEdges().forEach(edge => {
                    g1.setItemState(edge, 'selected', true);
                })
                // gh.setItemState(item, 'focus', true);
            });

            g1.on('canvas:click', (evt) => {
                clearSelectedNodesState(g1)
                clearSelectedEdgesState(g1)
                setSelected(false)
            });


            const newData = filterData(data[0], dashboardId, panel.id)
            gh.data(newData);
            console.log("here3333:", newData)
            gh.render();
            setGraph(gh)
            if (typeof window !== 'undefined') {
                window.onresize = () => {
                    if (!graph || gh.get('destroyed')) return;
                    if (!container || !container.current.scrollWidth || !container.current.scrollHeight) return;
                    gh.changeSize(container.current.scrollWidth, container.current.scrollHeight);
                };
            }
        }
    }, []);

    const onSelectChange = useCallback(v => setSelected(v), [])


    return <>
        {graph && <NodeGraphToolbar graph={graph} dashboardId={dashboardId} panelId={panel.id} data={data[0]} onFilterRulesChange={onFilterRulesChange} />}
        <Box width="100%" height="100%" ref={container} />
        <Help data={nodeGraphHelp} iconSize="0.8rem" />
        {graph && <Box><HiddenItems dashboardId={dashboardId} panelId={panel.id} selected={selected} graph={graph} onSelectChange={onSelectChange} data={data} /></Box>}
    </>;
}

const clearSelectedNodesState = graph => {
    const selectedNodes = graph.findAllByState('node', 'selected')
    selectedNodes.forEach(node => {
        graph.setItemState(node, 'selected', false)
    })
}

const clearSelectedEdgesState = graph => {
    const selectedEdges = graph.findAllByState('edge', 'selected')
    selectedEdges.forEach(edge => {
        graph.clearItemStates(edge)
    })
}


export default NodeGrapPanel

export const initNodeGraphSettings = {

}




const onColorModeChange = (graph, data, colorMode,dashboardId,panelId) => {
    const defaultNodeLabelCfg = getDefaultNodeLabel(colorMode)
    const defaultEdgeLabelCfg = getDefaultEdgeLabel(colorMode)

    data[0].nodes.forEach((node: any) => {
        if (!node.labelCfg) {
            node.labelCfg = defaultNodeLabelCfg
        } else {
            node.labelCfg.style.fill = colorMode == "light" ? '#000' : '#fff'
        }

        node.donutColorMap = colorMode == "light" ? donutLightColors : donutDarkColors

        const defaultNodeStyle = getDefaultNodeStyle(colorMode)
        Object.keys(defaultNodeStyle).forEach(key => {
            node.stateStyles[key] = defaultNodeStyle[key]
        })
        
    })

    data[0].edges.forEach((edge: any) => {
        if (!edge.labelCfg) {
            edge.labelCfg = defaultEdgeLabelCfg
        } else {
            edge.labelCfg.style.fill = colorMode == "light" ? '#000' : '#fff'
        }
        edge.style.stroke = colorMode == "light" ? '#ddd' : '#444'
        const defaultEdgeStyle = getDefaultEdgeStyle(colorMode)
        Object.keys(defaultEdgeStyle).forEach(key => {
            edge.stateStyles[key] = defaultEdgeStyle[key]
        })
    })
    const newData = filterData(data[0], dashboardId, panelId)
    console.log("here333332:",newData)
    graph.data(newData)
    graph.render()
}
