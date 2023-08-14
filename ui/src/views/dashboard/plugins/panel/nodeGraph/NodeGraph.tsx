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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import G6, { Graph } from '@antv/g6';
import { Box, Center, Text, VStack, useColorMode, useToast } from '@chakra-ui/react';
import { Panel, PanelData, PanelProps } from 'types/dashboard';
import { initTooltip } from './plugins/tooltip';
import { getActiveEdgeLabelCfg } from './default-styles';
import { initLegend } from './plugins/legend';
import { setAttrsForData } from './transformData';
import { NodeGraphToolbar } from './Toolbar';
import Help from 'components/Help';
import { nodeGraphHelp } from './data/help';
import useContextMenu from './plugins/useContextMenu';
import HiddenItems from './HiddenItem';
import { filterData } from './filter/filterData';
import { getDefaultEdgeLabel, getDefaultEdgeStyle, getDefaultNodeLabel, getDefaultNodeStyle } from './default-styles';
import { NodeGraphPluginData } from 'types/plugins/nodeGraph';
import { isFunction } from 'lodash';
import { colors, paletteColorNameToHex } from 'utils/colors';
import './customNode'
import { registerCustomNode } from './customNode';
import { dispatch } from 'use-bus';
import { PanelForceRebuildEvent } from 'src/data/bus-events';
import { genDynamicFunction } from 'utils/dynamicCode';
import lodash from 'lodash'
import { useStore } from '@nanostores/react';
import { nodeGraphPanelMsg } from 'src/i18n/locales/en';
import { isEmpty } from 'utils/validate';
import { isNodeGraphData } from './utils';



interface NodeGraphPanelProps extends PanelProps {
    data: NodeGraphPluginData[]
}

const NodeGraphPanelWrapper = (props: NodeGraphPanelProps) => {
    if (isEmpty(props.data)) {
        return <Center height="100%">No data</Center>
    }

    return (<>
        {
            !isNodeGraphData(props.data[0])
                ?
                <Center height="100%">
                    <VStack>
                        <Text fontWeight={500} fontSize="1.1rem">Data format not support!</Text>
                        <Text className='color-text'>Try to change to Testdata datasource, then look into its data format in Panel Debug</Text>
                    </VStack>
                </Center>
                :
                <NodeGrapPanel {...props} />
        }
    </>
    )
}
export default NodeGraphPanelWrapper

let newestColorMode;
const NodeGrapPanel = ({ data, panel, dashboardId, width, height }: NodeGraphPanelProps) => {
    if (isEmpty(data)) {
        return (<Center height="100%">No data</Center>)
    }
    const t1 = useStore(nodeGraphPanelMsg)
    const toast = useToast()
    const container = React.useRef(null);
    const [graph, setGraph] = useState<Graph>(null);
    const { colorMode } = useColorMode();
    const defaultNodeLabelCfg = getDefaultNodeLabel(colorMode)
    const defaultEdgeLabelCfg = getDefaultEdgeLabel(colorMode, panel.plugins.nodeGraph)

    const [selected, setSelected] = useState(false)
    const contextMenu = useContextMenu(panel.plugins.nodeGraph)
    const donutColors = {}
    panel.plugins.nodeGraph.node.donutColors.forEach(item => { donutColors[item.attr] = item.color })
    const legend = useMemo(() => initLegend(donutColors), [])
    const highlightNodeNames = useMemo(() => {
        let names = []
        if (panel.plugins.nodeGraph.node.enableHighlight) {
            const filterHighlight = genDynamicFunction(panel.plugins.nodeGraph.node.highlightNodesByFunc);
            if (isFunction(filterHighlight)) {
                names = filterHighlight(data[0], lodash)
            } else {
                toast({
                    description: t1.invalidHighlight,
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
        return names
    }, [panel.plugins.nodeGraph.node.highlightNodesByFunc, panel.plugins.nodeGraph.node.enableHighlight])
    useEffect(() => {
        if (graph) {
            graph.changeSize(width, height)
            graph.render()
        }
    }, [width, height])

    useEffect(() => {
        if (graph) {
            onColorModeChange(graph, data, colorMode, dashboardId, panel)
        }
        newestColorMode = colorMode
        registerCustomNode(colorMode, panel.plugins.nodeGraph.node.enableHighlight, panel.plugins.nodeGraph.node.highlightNodes, paletteColorNameToHex(panel.plugins.nodeGraph.node.highlightColor), highlightNodeNames)
        if (graph) {
            dispatch(PanelForceRebuildEvent + panel.id)
        }
    }, [colorMode, panel.plugins.nodeGraph.node.enableHighlight, panel.plugins.nodeGraph.node.highlightNodes, panel.plugins.nodeGraph.node.highlightColor, highlightNodeNames])

    useEffect(() => {
        if (graph) {
            onDataAndSettingsChange(panel, data, colorMode, dashboardId, graph)
        }
    }, [data])

    useEffect(() => {
        if (graph) {
            onDataAndSettingsChange(panel, data, colorMode, dashboardId, graph)
            const layout = {
                nodeStrength: panel.plugins.nodeGraph.layout.nodeStrength,
                gravity: panel.plugins.nodeGraph.layout.gravity
            }
            graph.updateLayout(layout)

        }
    }, [panel.plugins])

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
            console.time("init node graph, time used: ")
            const tooltip = initTooltip(panel.plugins.nodeGraph)

            setAttrsForData(panel.plugins.nodeGraph, data[0], colorMode)


            const plugins = [tooltip, contextMenu]
            if (panel.plugins.nodeGraph.legend.enable) {
                plugins.push(legend as any)
            }

            const gh = new G6.Graph({
                container: container.current,
                // width: container.current.scrollWidth,
                // height: container.current.scrollHeight,
                // fitView: true,
                fitCenter: true,
                fitViewPadding: 16,
                plugins: plugins,
                modes: {
                    default: [
                        panel.plugins.nodeGraph.zoomCanvas && 'zoom-canvas',
                        panel.plugins.nodeGraph.scrollCanvas && 'scroll-canvas',
                        panel.plugins.nodeGraph.dragNode && 'drag-node',
                        'activate-relations',
                        panel.plugins.nodeGraph.dragCanvas && 'drag-canvas',
                        'click-select',
                        {
                            type: 'lasso-select',
                            onSelect(nodes, edges) {
                                setSelected(true)
                            }
                        }],
                    fisheyeMode: []
                },
                layout: {
                    type: 'force2',
                    gpuEnabled: true,
                    // focusNode: 'li',
                    // linkDistance: 100,
                    preventOverlap: true,
                    nodeStrength: panel.plugins.nodeGraph.layout.nodeStrength,
                    gravity: panel.plugins.nodeGraph.layout.gravity,
                    preset: {
                        type: 'radial'
                    }
                },
                defaultEdge: {
                    type: panel.plugins.nodeGraph.edge.shape ?? 'quadratic',

                    style: {
                        radius: 10,
                        // offset: 30,
                        endArrow: panel.plugins.nodeGraph.edge.arrow == "default" ? true : {
                            path: G6.Arrow[panel.plugins.nodeGraph.edge.arrow](),
                            fill: colorMode == "light" ? paletteColorNameToHex(panel.plugins.nodeGraph.edge.color.light, colorMode) : paletteColorNameToHex(panel.plugins.nodeGraph.edge.color.dark, colorMode),
                        },
                        // lineAppendWidth: 2,
                        opacity: panel.plugins.nodeGraph.edge.opacity,
                        lineWidth: 1,
                        stroke: colorMode == "light" ? paletteColorNameToHex(panel.plugins.nodeGraph.edge.color.light, colorMode) : paletteColorNameToHex(panel.plugins.nodeGraph.edge.color.dark, colorMode)
                    },
                    labelCfg: defaultEdgeLabelCfg,
                    stateStyles: {

                    }
                },
                defaultNode: {
                    type: 'custom',
                    style: {
                        lineWidth: 2,
                        fill: 'transparent',
                        stroke: colors[0]
                    },
                    size: panel.plugins.nodeGraph.node.baseSize,
                    labelCfg: defaultNodeLabelCfg,
                    donutColorMap: donutColors,
                    stateStyles: {
                    }
                },
                nodeStateStyles: getDefaultNodeStyle(panel.plugins.nodeGraph, colorMode),
                edgeStateStyles: getDefaultEdgeStyle(panel.plugins.nodeGraph, colorMode),
            });

            const g1 = gh
            g1.on('node:mouseenter', (evt) => {
                const { item } = evt;
                g1.setItemState(item, 'active', true);
                gh.getEdges().forEach(edge => {
                    gh.updateItem(edge, {
                        labelCfg: {
                            ...defaultEdgeLabelCfg,
                            style: {
                                opacity: 0
                            }
                        }
                    })
                })
                //@ts-ignore
                item.getEdges().forEach(edge => {
                    g1.updateItem(edge, {
                        // as we can't fetch the newest colorMode here, we use a global variable instead
                        labelCfg: getActiveEdgeLabelCfg(newestColorMode, panel.plugins.nodeGraph)
                    })
                })
            });

            g1.on('node:mouseleave', (evt) => {
                const { item } = evt;
                g1.setItemState(item, 'active', false);

                if (!item.hasState('selected')) {
                    //@ts-ignore
                    item.getEdges().forEach(edge => {
                        g1.updateItem(edge, {
                            labelCfg: defaultEdgeLabelCfg
                        })
                    })
                }

                gh.getEdges().forEach(edge => {
                    // graph.clearItemStates(edge)
                    gh.updateItem(edge, {
                        labelCfg: defaultEdgeLabelCfg
                    })
                })
            });

            g1.on('node:click', (evt) => {
                const { item } = evt;
                g1.setItemState(item, 'selected', true);

                setSelected(true)
            })

            g1.on('node:dblclick', (evt) => {
                // clearSelectedNodesState(g1)
                // clearSelectedEdgesState(g1,defaultEdgeLabelCfg)

                const { item } = evt;
                g1.setItemState(item, 'selected', true);
                //@ts-ignore
                item.getEdges().forEach(edge => {
                    g1.updateItem(edge, {
                        labelCfg: getActiveEdgeLabelCfg(newestColorMode, panel.plugins.nodeGraph)
                    })
                    g1.setItemState(edge, 'selected', true);
                })
            });

            g1.on('canvas:click', (evt) => {
                clearSelectedEdgesState(g1, defaultEdgeLabelCfg)
                // clearSelectedNodesState(g1,defaultEdgeLabelCfg)
                setSelected(false)
            });


            const newData = filterData(data[0], dashboardId, panel.id)
            gh.data(newData);

            gh.render();

            setGraph(gh)
            // if (typeof window !== 'undefined') {
            //     window.onresize = () => {
            //         if (!gh || gh.get('destroyed')) return;
            //         if (!container || !container.current.scrollWidth || !container.current.scrollHeight) return;
            //         gh.changeSize(container.current.clientWidth, container.current.clientHeight);
            //         gh.render()
            //     };
            // }
        }
    }, [panel.plugins.nodeGraph]);

    const onSelectChange = useCallback(v => setSelected(v), [])


    return <>
        {graph && <NodeGraphToolbar graph={graph} dashboardId={dashboardId} panelId={panel.id} data={data[0]} onFilterRulesChange={onFilterRulesChange} />}
        <Box width="100%" height="100%" ref={container} />
        <Help data={nodeGraphHelp} iconSize="0.8rem" />
        {graph && <Box><HiddenItems dashboardId={dashboardId} panelId={panel.id} selected={selected} graph={graph} onSelectChange={onSelectChange} data={data} /></Box>}
    </>;
}

const clearSelectedNodesState = (graph: Graph, defaultEdgeLabelCfg?) => {
    const selectedNodes = graph.findAllByState('node', 'selected')
    const nodes = graph.getNodes()
    nodes.forEach(node => {
        if (node.hasState('selected')) {
            if (defaultEdgeLabelCfg) {
                setTimeout(() => {
                    //@ts-ignore

                    node.getEdges().forEach(edge => {
                        graph.updateItem(edge, {
                            labelCfg: defaultEdgeLabelCfg
                        })
                    })
                }, 200)
            }


            graph.setItemState(node, 'selected', false)
        }
    })
}

const clearSelectedEdgesState = (graph: Graph, defaultEdgeLabelCfg) => {
    // const selectedEdges = graph.findAllByState('edge', 'selected')
    graph.getEdges().forEach(edge => {
        // graph.clearItemStates(edge)
        graph.updateItem(edge, {
            labelCfg: defaultEdgeLabelCfg
        })
    })
}



const onColorModeChange = (graph, data, colorMode, dashboardId, panel: Panel) => {
    const defaultNodeLabelCfg = getDefaultNodeLabel(colorMode)
    const defaultEdgeLabelCfg = getDefaultEdgeLabel(colorMode, panel.plugins.nodeGraph)

    data[0].nodes.forEach((node: any) => {
        if (!node.labelCfg) {
            node.labelCfg = defaultNodeLabelCfg
        } else {
            node.labelCfg.style.fill = colorMode == "light" ? '#000' : '#fff'
        }

        const defaultNodeStyle = getDefaultNodeStyle(panel.plugins.nodeGraph, colorMode)
        if (!node.stateStyles) node.stateStyles = {}
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
        edge.style.stroke = colorMode == "light" ? paletteColorNameToHex(panel.plugins.nodeGraph.edge.color.light, colorMode) : paletteColorNameToHex(panel.plugins.nodeGraph.edge.color.dark, colorMode)
        const defaultEdgeStyle = getDefaultEdgeStyle(panel.plugins.nodeGraph, colorMode)
        if (!edge.stateStyles) edge.stateStyles = {}
        Object.keys(defaultEdgeStyle).forEach(key => {
            edge.stateStyles[key] = defaultEdgeStyle[key]
        })

    })
    const newData = filterData(data[0], dashboardId, panel.id)
    graph.data(newData)
    graph.render()
}



const onDataAndSettingsChange = (panel: Panel, data: PanelData[], colorMode, dashboardId, graph) => {
    setAttrsForData(panel.plugins.nodeGraph, data[0], colorMode)
    const newData = filterData(data[0], dashboardId, panel.id)
    if (newData != data[0]) {
        graph.data(newData)
        graph.render()
    } else {
        graph.changeData(newData)
    }
}


