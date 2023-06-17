import { EdgeConfig, NodeConfig } from "@antv/g6"

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