import { Trace } from "types/plugins/trace"
import { cacheAs, Digraph, LayoutManager } from '../plexus';
import { useEffect, useState } from "react";
import { getEdgesAndVertices, getUiFindVertexKeys } from "./utils";
import { Box, Input, useColorModeValue } from "@chakra-ui/react";
import renderNode, { getNodeEmphasisRenderer } from "./renderNode";


interface Props {
    traceA: Trace
    traceB: Trace
}
const { classNameIsSmall, scaleOpacity, scaleStrokeOpacity } = Digraph.propsFactories;
const TraceCompareGraph = ({ traceA, traceB }: Props) => {
    const [layoutManager, setLayoutManager] = useState<LayoutManager>(null)
    const [search, setSearch] = useState('')
    const cacheAs1 = cacheAs.makeScope();
    useEffect(() => {
        const lm = new LayoutManager({ useDotEdges: true, splines: 'polyline' });
        setLayoutManager(lm)

        return () => {
            lm.stopAndRelease()
        }
    }, [])

    const { edges, vertices } = getEdgesAndVertices(traceA, traceB);
    const keys = getUiFindVertexKeys(search, vertices);
    return (<>
            <Box position="absolute" top="0" bottom="0" left="0" right="0" bg={useColorModeValue("#f7f9fb", "inherit")} sx={{
                '.DiffNode.is-same': {
                    background:  useColorModeValue("#f7f9fb", '#2D3748')
                }
            }}>
                {layoutManager && <Digraph
                    // `key` is necessary to see updates to the graph when a or b changes
                    // TODO(joe): debug this issue in Digraph
                    key={`${traceA.traceID} vs ${traceB.traceID}`}
                    minimap
                    zoom
                    minimapClassName="u-miniMap"
                    layoutManager={layoutManager}
                    measurableNodesKey="nodes"
                    layers={[
                        {
                            key: 'emphasis-nodes',
                            layerType: 'svg',
                            renderNode: getNodeEmphasisRenderer(keys),
                        },
                        {
                            key: 'edges',
                            layerType: 'svg',
                            edges: true,
                            defs: [{ localId: 'arrow' }],
                            markerEndId: 'arrow',
                            setOnContainer: cacheAs1('edges/container', [
                                scaleOpacity,
                                scaleStrokeOpacity,
                                { stroke: '#bbb',fill:'#bbb' },
                            ]),
                        },
                        {
                            renderNode,
                            key: 'nodes',
                            measurable: true,
                            layerType: 'html',
                        },
                    ]}
                    setOnGraph={classNameIsSmall}
                    edges={edges}
                    vertices={vertices}
                />}
            </Box>
            <Box position="absolute" right="20px" bottom="20px" width='200px'>
                <Input value={search} onChange={e => setSearch(e.currentTarget.value)}  placeholder="find.." className="highlight-bordered"/>
            </Box>
        </>)
}

export default TraceCompareGraph