import { IGraph, FilterConditions, NodeFilterType, ConditionFilterType, ConditionMetric, IGraphNode,IGraphEdge } from './types'
import { indexOf, find ,cloneDeep} from 'lodash'
const { ALL, IN, OUT_OF } = NodeFilterType
const { AND, OR } = ConditionFilterType



export function filterGraph(graph:IGraph, filter: FilterConditions) : IGraph {
    let lastStepNodes = graph.nodes
    let lastStepEdges = graph.edges

    let nodes: IGraphNode[] = []
    let edges: IGraphEdge[] = []

    if (filter.nodes.type === ALL) {
        nodes = graph.nodes
        edges = graph.edges
    }

    if (filter.nodes.type === IN) {
        graph.nodes.forEach(node => {
            if (indexOf(filter.nodes.names, node.name) !== -1) {
                addNode(nodes,node)
            }
        })

        graph.edges.forEach(edge => {
            let node
            if (indexOf(filter.nodes.names, edge.source) !== -1) {
                node = findNode(graph.nodes,edge.target)
                if (node) {
                    addNode(nodes,node)
                }
            }

            if (indexOf(filter.nodes.names, edge.target) !== -1) {
                node = findNode(graph.nodes,edge.source)
                if (node) {
                    addNode(nodes,node)
                }
            }

            if (node) {
                edges.push(edge)
            }
        })
    }
    
    if (filter.nodes.type === OUT_OF) {
        graph.nodes.forEach(node => {
            if (indexOf(filter.nodes.names, node.name) === -1) {
                addNode(nodes,node)
            }
        })
        graph.edges.forEach(edge => {
            if (indexOf(filter.nodes.names, edge.source) === -1 && indexOf(filter.nodes.names, edge.target) === -1) {
                edges.push(edge)
            }
        })
    }

    for (const condition of filter.conditions) {
        if (condition.type === OR) {
            lastStepNodes.forEach(node => {
                if (!node.metrics) {
                    return 
                }
                if (condition.operator === '>=') {
                    if (node.metrics[condition.metric] >= condition.value) {
                        addNode(nodes, node)
                    }
                } else {
                    if (node.metrics[condition.metric] <= condition.value) {
                        addNode(nodes, node)
                    }
                }
            })

            lastStepEdges.forEach(edge => {
                if (condition.operator === '>=') {
                    if (edge.metrics[condition.metric] >= condition.value) {
                        addEdge(edges, edge)
                    }
                } else {
                    if (edge.metrics[condition.metric] <= condition.value) {
                        addEdge(edges, edge)
                    }
                }
            })
        } else {
            lastStepNodes = cloneDeep(nodes) 
            lastStepEdges = cloneDeep(edges)

            const newNodes = []
            const newEdges = []

            lastStepNodes.forEach(node => {
                if (!node.metrics) {
                    return 
                }
                if (condition.operator === '>=') {
                    if (node.metrics[condition.metric] >= condition.value) {
                        addNode(newNodes, node)
                    }
                } else {
                    if (node.metrics[condition.metric] <= condition.value) {
                        addNode(newNodes, node)
                    }
                }
            })

            lastStepEdges.forEach(edge => {
                if (condition.operator === '>=') {
                    if (edge.metrics[condition.metric] >= condition.value) {
                        addEdge(newEdges, edge)
                    }
                } else {
                    if (edge.metrics[condition.metric] <= condition.value) {
                        addEdge(newEdges, edge)
                    }
                }
            })

            nodes = newNodes
            edges = newEdges
        }
    }

    // 把edges所有的端点都加入到nodes中
    edges.forEach(edge => {
        if (!findNode(nodes,  edge.source)) {
            const node = findNode(graph.nodes, edge.source)
            nodes.push(node)
        }

        if (!findNode(nodes,  edge.target)) {
            const node = findNode(graph.nodes, edge.target)
            nodes.push(node)
        }
    })
    
    return {nodes: nodes,edges: edges}
}

function addNode(nodes: IGraphNode[], node: IGraphNode) {
    if (!find(nodes, {name: node.name})) {
        nodes.push(node)
    }
}

function findNode(nodes: IGraphNode[], name: string) {
    return  find(nodes, {name: name})
}


function addEdge(edges: IGraphEdge[], edge: IGraphEdge) {
    if (!find(edges, {source: edge.source,target: edge.target})) {
        edges.push(edge)
    }
}