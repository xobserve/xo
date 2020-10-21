import _, { groupBy, filter, map, sum, some, isUndefined, uniq, difference, flatMap, concat, mean, defaultTo, find, size, isNaN } from 'lodash';
import { isPresent } from '../utils';
import { DependencyGraph } from '../DependencyGraph';
import { GraphDataElement, IGraph, IGraphEdge, IGraphMetrics, IGraphNode, EGraphNodeType, GraphDataType, ExternalType } from '../types';

class GraphGenerator {
    controller: DependencyGraph;

    constructor(controller: DependencyGraph) {
        this.controller = controller;
    }

    _createNode(dataElements: GraphDataElement[]): IGraphNode | undefined {

        if (!dataElements || dataElements.length <= 0) {
            return undefined;
        }

        console.log(dataElements)
        // 	const sumMetrics = this.controller.props.options.sumTimings;

        // 	const nodeName = dataElements[0].target;
        // 	const internalNode = some(dataElements, ['type', GraphDataType.INTERNAL]) || some(dataElements, ['type', GraphDataType.EXTERNAL_IN]);
        // 	const nodeType = internalNode ? EGraphNodeType.INTERNAL : EGraphNodeType.EXTERNAL;

        // 	const metrics: IGraphMetrics = {};

        // 	const node: IGraphNode = {
        // 		name: nodeName,
        // 		type: nodeType,
        // 		metrics
        // 	};

        // 	const aggregationFunction = sumMetrics ? sum : mean;

        // 	if (internalNode) {
        // 		metrics.rate = sum(map(dataElements, element => element.data.rate_in));
        // 		metrics.error_rate = sum(map(dataElements, element => element.data.error_rate_in));

        // 		const response_timings = map(dataElements, element => element.data.response_time_in).filter(isPresent);
        // 		if (response_timings.length > 0) {
        // 			metrics.response_time = aggregationFunction(response_timings);
        // 		}
        // 	} else {
        // 		metrics.rate = sum(map(dataElements, element => element.data.rate_out));
        // 		metrics.error_rate = sum(map(dataElements, element => element.data.error_rate_out));

        // 		const response_timings = map(dataElements, element => element.data.response_time_out).filter(isPresent);
        // 		if (response_timings.length > 0) {
        // 			metrics.response_time = aggregationFunction(response_timings);
        // 		}

        // 		const externalType = _(dataElements)
        // 			.map(element => element.data.type)
        // 			.uniq()
        // 			.value();
        // 		if (externalType.length == 1) {
        // 			node.external_type = externalType[0];
        // 		}
        // 	}

        // 	// metrics which are same for internal and external nodes
        // 	metrics.threshold = _(dataElements)
        // 		.map(element => element.data.threshold)
        // 		.filter()
        // 		.mean();

        // 	if (sumMetrics) {
        // 		const requestCount = defaultTo(metrics.rate, 0) + defaultTo(metrics.error_rate, 0);
        // 		const response_time = defaultTo(metrics.response_time, -1);
        // 		if (requestCount > 0 && response_time >= 0) {
        // 			metrics.response_time = response_time / requestCount;
        // 		}
        // 	}

        // 	const { rate, error_rate } = metrics;
        // 	if (rate + error_rate > 0) {
        // 		metrics.success_rate = 1.0 / (rate + error_rate) * rate;
        // 	} else {
        // 		metrics.success_rate = 1.0;
        // 	}

        // 	return node;
        // }

        // _createMissingNodes(data: GraphDataElement[], nodes: IGraphNode[]): IGraphNode[] {
        // 	const existingNodeNames = map(nodes, node => node.name);
        // 	const expectedNodeNames = uniq(flatMap(data, dataElement => [dataElement.source, dataElement.target])).filter(isPresent);
        // 	const missingNodeNames = difference(expectedNodeNames, existingNodeNames);

        // 	const missingNodes = map(missingNodeNames, name => {
        // 		let nodeType: EGraphNodeType;
        // 		let external_type: string | undefined;

        // 		// derive node type
        // 		let elementSrc = find(data, { source: name });
        // 		let elementTrgt = find(data, { target: name });
        // 		if (elementSrc && elementSrc.type == GraphDataType.EXTERNAL_IN) {
        // 			nodeType = EGraphNodeType.EXTERNAL;
        // 			external_type = elementSrc.data.type;
        // 		} else if (elementTrgt && elementTrgt.type == GraphDataType.EXTERNAL_OUT) {
        // 			nodeType = EGraphNodeType.EXTERNAL;
        // 			external_type = elementTrgt.data.type
        // 		} else {
        // 			nodeType = EGraphNodeType.INTERNAL;
        // 		}

        // 		return <IGraphNode>{
        // 			name,
        // 			type: nodeType,
        // 			external_type: external_type
        // 		};
        // 	});

        // 	return missingNodes;
    }

    _createNodes(data: GraphDataElement[]): IGraphNode[] {
        const filteredData = filter(data, dataElement => dataElement.source !== dataElement.target);

        const sumMetrics = this.controller.props.options.sumTimings;

        console.log(filteredData)
        const nodesMap = {}
        filteredData.forEach((e: GraphDataElement) => {
            const sourceNode = nodesMap[e.source]
            if (!sourceNode) {
                nodesMap[e.source] = {
                    name: e.source,
                    type: e.externalType === ExternalType.SourceExternal ? EGraphNodeType.EXTERNAL : EGraphNodeType.INTERNAL
                } as IGraphNode
            }

            const targetNode: IGraphNode = nodesMap[e.target]
            if (!targetNode) {
                nodesMap[e.target] = {
                    name: e.target,
                    type: e.externalType === ExternalType.TargetExternal ? EGraphNodeType.EXTERNAL : EGraphNodeType.INTERNAL,
                    metrics: {
                        requests: e.data.requests,
                        errors: e.data.errors,
                        errorRate: e.data.errors / e.data.requests,
                        responseTime: e.data.responseTime
                    }
                } as IGraphNode
            } else {
                targetNode.metrics = {
                    requests: targetNode.metrics.requests + e.data.requests,
                    errors: targetNode.metrics.errors + e.data.errors,
                    errorRate: (targetNode.metrics.errors + e.data.errors) / (targetNode.metrics.requests + e.data.requests),
                    responseTime: targetNode.metrics.responseTime + e.data.responseTime
                }
            }
        })

        const nodes = []
        _.forEach(nodesMap, (node: IGraphNode) => {
            if (sumMetrics && node.metrics) {
                const respTime = node.metrics.responseTime / node.metrics.requests
                if (isNaN(respTime)) {
                    node.metrics.responseTime = 0
                }
            }

            nodes.push(node)
        })

        return nodes
    }

    _createEdge(dataElement: GraphDataElement): IGraphEdge | undefined {
        const { source, target } = dataElement;

        if (source === undefined || target === undefined) {
            console.error("source and target are necessary to create an edge", dataElement);
            return undefined;
        }

        const metrics: IGraphMetrics = {
            requests: 0,
            errors: 0,
            errorRate: 0,
            responseTime: 0
        };

        const edge: IGraphEdge = {
            source,
            target,
            metrics
        };

        const { requests, errors, responseTime } = dataElement.data;

        if (!isUndefined(requests)) {
            metrics.requests = requests;
        }

        if (!isUndefined(errors)) {
            metrics.errors = errors
        }

        if (metrics.requests !== 0) {
            metrics.errorRate = metrics.errors / metrics.requests
        }

        if (!isUndefined(responseTime)) {
            const { sumTimings } = this.controller.props.options;

            if (sumTimings && metrics.requests) {
                metrics.responseTime = responseTime / metrics.requests;
            } else {
                metrics.responseTime = responseTime;
            }
        }

        return edge;
    }

    _createEdges(data: GraphDataElement[]): IGraphEdge[] {

        const filteredData = _(data)
            .filter(e => !!e.source)
            .filter(e => e.source !== e.target)
            .value();

        const edges = map(filteredData, element => this._createEdge(element));
        return edges.filter(isPresent);
    }

    _filterData(graph: IGraph): IGraph {
        const { filterEmptyConnections: filterData } = this.controller.props.options;

        if (filterData) {
            const filteredGraph: IGraph = {
                nodes: [],
                edges: []
            };

            // filter empty connections
            filteredGraph.edges = filter(graph.edges, edge => size(edge.metrics) > 0);

            filteredGraph.nodes = filter(graph.nodes, node => {
                const name = node.name;

                // don't filter connected elements
                if (some(graph.edges, { 'source': name }) || some(graph.edges, { 'target': name })) {
                    return true;
                }

                const metrics = node.metrics;
                if (!metrics) {
                    return false; // no metrics
                }

                // only if rate, error rate or response time is available
                return defaultTo(metrics.requests, -1) >= 0
                    || defaultTo(metrics.errors, -1) >= 0
                    || defaultTo(metrics.responseTime, -1) >= 0;
            });

            return filteredGraph;
        } else {
            return graph;
        }
    }

    generateGraph(graphData: GraphDataElement[]): IGraph {
        //const filteredData = this._filterData(graphData);

        const nodes = this._createNodes(graphData);
        const edges = this._createEdges(graphData);

        const graph: IGraph = {
            nodes,
            edges
        };

        const filteredGraph = this._filterData(graph);

        console.groupCollapsed('Graph generated');
        console.log('Input data:', graphData);
        console.log('Nodes:', nodes);
        console.log('Edges:', edges);
        console.log('Filtered graph', filteredGraph);
        console.groupEnd();

        return filteredGraph;
    }
}

export default GraphGenerator;