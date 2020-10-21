import cytoscape, { NodeSingular, EdgeSingular, EventObject, EdgeCollection } from 'cytoscape';
import cola from 'cytoscape-cola';
import cyCanvas from 'cytoscape-canvas';
import GraphCanvas from './canvas/graph_canvas';
import { DependencyGraph } from './DependencyGraph';
import styleOptions from './styleOptions'

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

    let settings =  styleOptions
    if (controller.props.options.styleSetting) {
        settings = JSON.parse(controller.props.options.styleSetting)
    }

    const eee = document.getElementsByClassName('panel-container')
    if (eee.length > 0) {
        const styles = window.getComputedStyle(eee[0],null)
        if (styles && styles['backgroundColor']) {
            settings.forEach(setting => {
                if (setting.selector === 'edge') {
                    setting['style']['line-color'] = styles['backgroundColor']
                }
            })
        }
    }


    controller.cy = cytoscape({
        container: graphContainer,
        style: settings,
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