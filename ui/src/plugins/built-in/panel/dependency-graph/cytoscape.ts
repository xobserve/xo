import cytoscape, { NodeSingular, EdgeSingular, EventObject, EdgeCollection } from 'cytoscape';
import cola from 'cytoscape-cola';
import cyCanvas from 'cytoscape-canvas';
import GraphCanvas from './canvas/graph_canvas';
import { DependencyGraph } from './DependencyGraph';

// Register cytoscape extensions
cyCanvas(cytoscape);
cytoscape.use(cola);

export let graphCanvas: GraphCanvas;
export let graphContainer: any

export function initCytoscape(controller:DependencyGraph) {
    const canvasClass = `#canvas-container-${controller.props.panel.id}`
    graphContainer = $(canvasClass) 
    console.log("container: ",graphContainer)

    const that = controller;

    console.log("Initialize cytoscape..");

    controller.cy = cytoscape({
        container: graphContainer,
        style: <any>[
            {
                "selector": "node",
                "style": {
                    "background-opacity": 0
                }
            },
            {
                "selector": "edge",
                "style": {
                    "visibility": "hidden"
                }
            }
        ],
        wheelSensitivity: 0.125
    });

    // create canvas layer
    const layer = (<any>controller.cy).cyCanvas({
        zIndex: 1
    });

    graphCanvas = new GraphCanvas(controller, controller.cy, layer);
    graphCanvas.start();
    if (!controller.state.paused) {
        graphCanvas.startAnimation();
    }

    controller.cy.reset();
    controller.cy.resize();
    controller.cy.center();

    controller.cy.on('render', (event) => {
        // trigger also repainting of the graph canvas overlay
        graphCanvas.repaint(true);
    });

    controller.cy.on('select', 'node', (event) => that.onSelectionChange(event));
    controller.cy.on('unselect', 'node', (event) => that.onSelectionChange(event));
}