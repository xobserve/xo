
import { PanelPluginComponents } from "types/plugin";
import PanelEditor from "./Editor";
import NodeGraphPanelWrapper from "./NodeGraph";
import { mockNodeGraphDataForTestDataDs } from "./mocks/mockData";
import icon from './nodegraph.svg'
import { colors1, getDefaultPanelColor, palettes } from "utils/colors";
import { PanelTypeNodeGraph } from "./types";

const panelComponents: PanelPluginComponents = {
    panel: NodeGraphPanelWrapper,
    editor: PanelEditor,
    mockDataForTestDataDs: mockNodeGraphDataForTestDataDs,
    settings: {
        type: PanelTypeNodeGraph,
        icon,
        initOptions: {
            zoomCanvas: false,
            scrollCanvas: false,
            dragNode: true,
            dragCanvas: true,
            node: {
                baseSize: 60,
                maxSize: 1.4,
                icon: [],
                shape: "donut",
                donutColors: [
                    { attr: 'success', color: colors1[2] },
                    { attr: 'error', color: colors1[6] }
                ],
                borderColor: getDefaultPanelColor(),
                tooltipTrigger: 'mouseenter',
                menu: [],
                enableHighlight: false,
                highlightNodes: '',
                highlightNodesByFunc:
                    `// data: {nodes, edges}
// return nodes name list, e.g ['node-1', 'node-2']
function highlightNodes(data, lodash) {
    const matchingNodeNames = []
    return matchingNodeNames
}
`,
                highlightColor: palettes[27]
            },

            edge: {
                shape: 'line', // quadratic
                arrow: 'default',
                color: {
                    light: '#ddd',
                    dark: "#8CA88C",
                },
                opacity: 0.6,
                highlightColor: {
                    light: '#C8F2C2',
                    dark: '#00B5D8'
                },
                display: true
            },

            legend: {
                enable: true
            },

            layout: {
                nodeStrength: 5000,
                gravity: 40,
            }
        },
    }
}

export default panelComponents