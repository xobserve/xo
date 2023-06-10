

import React, { useCallback, useEffect,  useLayoutEffect,  useState } from 'react';
import G6, { Graph } from '@antv/g6';
import { Box, Text, useColorMode } from '@chakra-ui/react';
import { PanelProps } from 'types/dashboard';
import { initTooltip } from './tooltip';
import { donutColors } from './utils';
import { initLegend } from './legend';
import { setAttrsForData } from './transformData';
import { NodeGraphToolbar } from './Toolbar';
import Help from 'components/help';
import { nodeGraphHelp } from './data/help';
import  useContextMenu  from './useContextMenu';
import HiddenItems from './HiddenItem';



const NodeGrapPanel = ({ data,panel,dashboardId }: PanelProps) => {
    const container = React.useRef(null);
    const [graph, setGraph] = useState<Graph>(null);
    const { colorMode } = useColorMode();
    const defaultNodeLabelCfg = {
        position: 'bottom',
        style: {
            fill: colorMode == "light" ? '#000' : '#fff',
        }
    }
    const [selected, setSelected] = useState(false)
    const contextMenu = useContextMenu()

    useEffect(() => {
        if (graph) {
            data[0].nodes.forEach((node: any) => {
                if (!node.labelCfg) {
                    node.labelCfg = defaultNodeLabelCfg
                } else {
                    node.labelCfg.style.fill = colorMode == "light" ? '#000' : '#fff'
                }
            })

            graph.changeData()
            graph.render()
        }
    }, [colorMode])

    useEffect(() => {
        if (graph) {
            setAttrsForData(data[0])
            graph.changeData(data[0])
        }
    }, [data])


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
                plugins: [legend, tooltip, contextMenu],
                modes: {
                    default: ['drag-node', 'activate-relations', 'drag-canvas',  'click-select',{
                        type: 'lasso-select',
                        onSelect(nodes,edges) {
                            setSelected(true)
                        }
                    }],
                    fisheyeMode: []
                },
                layout: {
                    type: 'force2',
                    // focusNode: 'li',
                    linkDistance: 300,
                    // unitRadius: 200,
                    preventNodeOverlap: true,
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
                    stateStyles: {
                        filterOut: {
                            visibility: 'hidden',
                        }
                    }
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
                    stateStyles: {
                        filterOut: {
                            visibility: 'hidden',
                        }
                    }
                },
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
                console.log(g1,item)
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

            gh.data(data[0]);
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

    const onSelectChange = useCallback(v => setSelected(v),[])

    return <>
        {graph && <NodeGraphToolbar graph={graph}  dashboardId={dashboardId} panelId={panel.id}/>}
        <Box width="100%" height="100%" ref={container} />
        <Help data={nodeGraphHelp} iconSize="0.8rem" />
        {graph && <Box><HiddenItems dashboardId={dashboardId} panelId={panel.id} selected={selected} graph={graph} onSelectChange={onSelectChange} data={data}/></Box>}
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



