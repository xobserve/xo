import { EdgeConfig, NodeConfig } from "@antv/g6"
import { Panel, PanelEditorProps } from "types/dashboard"

export const PanelTypeNodeGraph = "nodeGraph"

export interface NodeGraphPanel extends Panel {
    plugins: {
        [PanelTypeNodeGraph]: NodeGraphSettings
    }
}

export interface NodeGraphEditorProps extends PanelEditorProps {
    panel: NodeGraphPanel
}

export interface NodeGraphSettings {
    zoomCanvas: boolean
    scrollCanvas: boolean
    dragNode: boolean
    dragCanvas: boolean

    node: {
        baseSize: number
        maxSize: number
        icon: NodeGraphIcon[]
        shape: 'circle' | 'donut' | 'custom',
        donutColors: { attr: string; color: string }[]
        borderColor: string
        tooltipTrigger: 'mouseenter' | 'click'
        menu: NodeGraphMenuItem[]
        enableHighlight: boolean
        highlightNodes: string
        highlightNodesByFunc: string
        highlightColor: string
    }

    edge: {
        shape: string
        arrow: string
        color: {
            light: string
            dark: string
        }
        opacity: number
        highlightColor: {
            light: string
            dark: string
        }
        display: boolean
    }

    legend: {
        enable: boolean
    }

    layout: {
        nodeStrength: number,
        gravity: number
    }
}


export interface NodeGraphIcon {
    key: string
    value: string
    icon: string
    type: "label" | "data"
}

export interface NodeGraphMenuItem {
    id?: number
    name: string
    event: string
    enable: boolean
}




export interface NodeGraphPluginData {
    nodes: Node[]
    edges:  Edge[]
  }

export interface Node extends NodeConfig  {
    id: string 
    label: string
    data: {
        [key:string]:number
    }
}

export interface Edge extends EdgeConfig {
    source: string // source node id
    target: string // target node id
    label: string
    data: {
        [key:string]:number
    }
}