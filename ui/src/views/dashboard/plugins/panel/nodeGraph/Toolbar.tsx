import G6, { Graph } from "@antv/g6"
import { Box, HStack, Text, Tooltip } from "@chakra-ui/react"
import { memo, useEffect } from "react"
import { FaEye, FaMinus, FaPlus } from "react-icons/fa"

interface Props {
    graph: Graph
    setMenuTip: any
}
let fishEye = null;
const defaultMenuTip = 'press Esc to exit fisheye mode'

export const NodeGraphToolbar = memo(({ graph,setMenuTip }: Props) => {
    let fisheyeEnabled = true
    const toggleFishEye = () => {
        if (!graph || graph.destroyed) return;

        graph.get('canvas').setCursor('default');

        if (fisheyeEnabled && fishEye) {
            graph.removePlugin(fishEye);
            graph.setMode('default');

            setMenuTip({
                text: defaultMenuTip,
                display: 'none',
                opacity: 0,
            });
            fishEye = null
        } else {
            setMenuTip({
                text: defaultMenuTip,
                display: 'block',
                opacity: 1,
            });

            graph.setMode('fisheyeMode');
            fishEye = new G6.Fisheye({
                r: 249,
                minR: 100,
                maxR: 500,
                d: 2,
                delegateStyle: {
                    fill: '#0f0',
                    lineWidth: 0,
                    stroke: '#666',
                },
                // showLabel: true,
            });

            graph.addPlugin(fishEye);
        }
        // clickFisheyeIcon();
    };

    const escListener = (e) => {
        if (!graph || graph.destroyed) return;
        if (e.key !== 'Escape') return;
        if (fishEye) {
            graph.removePlugin(fishEye);
        }

        graph.setMode('default');


        graph.get('canvas').setCursor('default');

        // 设置 menuTip
        setMenuTip({
            text: defaultMenuTip,
            display: 'none',
            opacity: 0,
        });

        fishEye = null
    };

    useEffect(() => {
        if (graph && typeof window !== 'undefined') {
            window.addEventListener('keydown', escListener.bind(this));
            return window.removeEventListener('keydown', escListener.bind(this));
        }
    }, [graph])



    const handleZoomOut = () => {
        if (!graph || graph.destroyed) return;
        const current = graph.getZoom();
        const canvas = graph.get('canvas');
        const point = canvas.getPointByClient(canvas.get('width') / 2, canvas.get('height') / 2);
        const pixelRatio = canvas.get('pixelRatio') || 1;
        const ratio = 1 + 0.05 * 5;
        if (ratio * current > 5) {
            return;
        }
        graph.zoom(ratio, { x: point.x / pixelRatio, y: point.y / pixelRatio });
    };
    const handleZoomIn = () => {
        if (!graph || graph.destroyed) return;

        const current = graph.getZoom();
        const canvas = graph.get('canvas');
        const point = canvas.getPointByClient(canvas.get('width') / 2, canvas.get('height') / 2);
        const pixelRatio = canvas.get('pixelRatio') || 1;
        const ratio = 1 - 0.05 * 5;
        if (ratio * current < 0.3) {
            return;
        }
        graph.zoom(ratio, { x: point.x / pixelRatio, y: point.y / pixelRatio });
    };

    const handleFitViw = () => {
        if (!graph || graph.destroyed) return;
        graph.fitView(16);
    };
    return (<HStack spacing="3" className="nodegraph-toolbar" position="absolute" left="10px" top="7px" zIndex="1000" opacity="0.7">
        <Tooltip label="Zoom in"><Box  cursor="pointer" onClick={handleZoomIn}><FaMinus /></Box></Tooltip>
        <Tooltip label="Fit to canvas"><Text  cursor="pointer" fontWeight="600" onClick={handleFitViw}>FIT</Text></Tooltip>
        <Tooltip label="Zoom out"><Box cursor="pointer" onClick={handleZoomOut}><FaPlus /></Box></Tooltip>
        <Tooltip label="Fisheye magnifying,most useful when nodes squeezed together"><Box color="currentcolor" cursor="pointer" onClick={toggleFishEye}><FaEye /></Box></Tooltip>
    </HStack>)
})