

import React, { useCallback, useEffect,  useState } from 'react';
import G6, { Graph } from '@antv/g6';
import { Box, useColorMode } from '@chakra-ui/react';
import { PanelProps } from 'types/dashboard';
import { initTooltip } from './tooltip';
import { initContextMenu } from './contextMenu';
import { donutColors } from './utils';
import { initLegend } from './legend';
import { setAttrsForData } from './transformData';
import { NodeGraphToolbar } from './Toolbar';
import Help from 'components/help';
import { nodeGraphHelp } from './data/help';



const NodeGrapPanel = ({ data }: PanelProps) => {
    // menu tip, 例如 “按下 ESC 退出鱼眼”
    const [menuTip, setMenuTip] = useState({
        text: '',
        display: 'none',
        opacity: 0,
    });

    const container = React.useRef(null);
    const [graph, setGraph] = useState<Graph>(null);
    const { colorMode } = useColorMode();
    const defaultNodeLabelCfg = {
        position: 'bottom',
        style: {
            fill: colorMode == "light" ? '#000' : '#fff',
        }
    }

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

            const contextMenu = initContextMenu()

            setAttrsForData(data[0])

            const legend = initLegend()

            const gh = new G6.Graph({
                container: container.current,
                width: container.current.scrollWidth,
                height: container.current.scrollHeight,
                fitCenter: true,
                plugins: [legend, tooltip, contextMenu],
                modes: {
                    default: ['drag-node', 'activate-relations', 'drag-canvas', 'lasso-select', 'click-select'],
                    fisheyeMode: []
                },
                layout: {
                    type: 'radial',
                    focusNode: 'li',
                    linkDistance: 150,
                    unitRadius: 200,
                    preventNodeOverlap: true
                },
                defaultEdge: {
                    type: 'line',
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

            console.log(data[0])
            gh.data(data[0]);
            gh.render();
            gh.on('node:mouseenter', (evt) => {
                const { item } = evt;
                gh.setItemState(item, 'active', true);
            });

            gh.on('node:mouseleave', (evt) => {
                const { item } = evt;
                gh.setItemState(item, 'active', false);
            });

            gh.on('node:click', (evt) => {
                const { item } = evt;
                gh.setItemState(item, 'selected', true);
            })

            gh.on('node:dblclick', (evt) => {
                clearSelectedNodesState(gh)
                clearSelectedEdgesState(gh)

                const { item } = evt;
                gh.setItemState(item, 'selected', true);
                //@ts-ignore
                item.getEdges().forEach(edge => {
                    gh.setItemState(edge, 'selected', true);
                })
                // gh.setItemState(item, 'focus', true);
            });
            gh.on('canvas:click', (evt) => {
                clearSelectedNodesState(gh)
                clearSelectedEdgesState(gh)
            });

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






    const onMenuTipChange = useCallback(v => setMenuTip(v),[])

    return <>
        <NodeGraphToolbar graph={graph} setMenuTip={onMenuTipChange} />
        <Box width="100%" height="100%" ref={container} />
        <Box className="nodegraph-menutip bordered" opacity={menuTip.opacity} position="absolute" right="10px" width="fit-content" top="7px" borderRadius='8px' transition="all 0.2s linear" px="2" py="1" fontSize="0.9rem">{menuTip.text}</Box>
        <Help data={nodeGraphHelp} iconSize="0.8rem" />
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



