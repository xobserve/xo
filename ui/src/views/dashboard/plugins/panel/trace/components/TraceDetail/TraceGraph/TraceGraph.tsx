// Copyright (c) 2018 The Jaeger Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { Digraph, LayoutManager } from '../../plexus';
import cacheAs from '../..//plexus/lib/cacheAs';
import './TraceGraph.css';
import {
    getNodeRenderer,
    getNodeFindEmphasisRenderer,
    renderNodeVectorBorder,
    MODE_SERVICE,
    MODE_TIME,
    MODE_SELFTIME,
    HELP_TABLE,
} from './OpNode';
import { TEv, TSumSpan } from './types';
import { TDenseSpanMembers } from '../../../model/trace-dag/types';
import TDagPlexusVertex from '../../../model/trace-dag/types/TDagPlexusVertex';
import { TNil } from 'types/misc';
import { Box, Button, Flex, Tooltip, useColorModeValue } from '@chakra-ui/react';
import IconButton from 'components/button/IconButton';
import { FaQuestion, FaTimes } from 'react-icons/fa';
import Card from 'components/Card';


type Props = {
    ev?: TEv | TNil;
    search: string | TNil;
    uiFindVertexKeys: Set<string> | TNil;
};

const { classNameIsSmall, scaleOpacity, scaleStrokeOpacity } = Digraph.propsFactories;

export function setOnEdgePath(e: any) {
    return e.followsFrom ? { strokeDasharray: 4 } : {};
}

const HELP_CONTENT = (
    <div className="TraceGraph--help-content">
        {HELP_TABLE}
        <div>
            <table>
                <tbody>
                    <tr>
                        <td>
                            <IconButton size="sm">
                                S
                            </IconButton>
                        </td>
                        <td>Service</td>
                        <td>Colored by service</td>
                    </tr>
                    <tr>
                        <td>
                            <Button size="sm">
                                T
                            </Button>
                        </td>
                        <td>Time</td>
                        <td>Colored by total time</td>
                    </tr>
                    <tr>
                        <td>
                            <Button size="sm">
                                ST
                            </Button>
                        </td>
                        <td>Selftime</td>
                        <td>Colored by self time (*)</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <svg width="100%" height="40">
                <line x1="0" y1="10" x2="90" y2="10" style={{ stroke: '#000', strokeWidth: 2 }} />
                <text alignmentBaseline="middle" x="100" y="10">
                    ChildOf
                </text>
                <line
                    x1="0"
                    y1="30"
                    x2="90"
                    y2="30"
                    style={{ stroke: '#000', strokeWidth: 2, strokeDasharray: '4' }}
                />
                <text alignmentBaseline="middle" x="100" y="30">
                    FollowsFrom
                </text>
            </svg>
        </div>
        <div>
            (*) <b>Self time</b> is the total time spent in a span when it was not waiting on children. For example,
            a 10ms span with two 4ms non-overlapping children would have <b>self-time = 10ms - 2 * 4ms = 2ms</b>.
        </div>
    </div>
);

const TraceGraph = (props: Props) => {
    const [showHelp, setShowHelp] = useState(false)
    const [mode, setMode] = useState(MODE_SELFTIME)

    let layoutManager: LayoutManager;
    if (!layoutManager) {
        layoutManager = new LayoutManager({
            totalMemory: undefined,
            useDotEdges: true,
            splines: 'polyline',
        });
    }
    const cacheAs1 = cacheAs.makeScope();

    useEffect(() => {
        () => {
            layoutManager.stopAndRelease();
        }
    })

    const toggleNodeMode = (newMode: string) => {
        setMode(newMode)
    }

    const _showHelp = () => {
        setShowHelp(true)
    };

    const closeSidebar = () => {
        setShowHelp(false)
    };

    const { ev = null, search, uiFindVertexKeys } = props
    if (!ev) {
        return <h1 className="u-mt-vast u-tx-muted ub-tx-center">No trace found</h1>;
    }

    const wrapperClassName = cx('TraceGraph--graphWrapper', { 'is-uiFind-mode': search });

    return (
        <Box className={wrapperClassName} style={{ paddingTop: 0 }} bg={useColorModeValue("#f0f0f0", "initial")}>
            <Digraph<TDagPlexusVertex<TSumSpan & TDenseSpanMembers>>
                minimap
                zoom
                className="TraceGraph--dag"
                minimapClassName="u-miniMap"
                layoutManager={layoutManager}
                measurableNodesKey="nodes"
                layers={[
                    {
                        key: 'node-find-emphasis',
                        layerType: 'svg',
                        renderNode: getNodeFindEmphasisRenderer(uiFindVertexKeys),
                    },
                    {
                        key: 'edges',
                        edges: true,
                        layerType: 'svg',
                        defs: [{ localId: 'arrow' }],
                        markerEndId: 'arrow',
                        setOnContainer: cacheAs1('edges/container', [
                            scaleOpacity,
                            scaleStrokeOpacity,
                            { stroke: '#bbb',fill:'#bbb' },
                        ]),
  
                        setOnEdge: setOnEdgePath,
                    },
                    {
                        key: 'nodes-borders',
                        layerType: 'svg',
                        setOnContainer: scaleStrokeOpacity,
                        renderNode: renderNodeVectorBorder,
                    },
                    {
                        key: 'nodes',
                        layerType: 'html',
                        measurable: true,
                        renderNode: cacheAs(`trace-graph/nodes/render/${mode}`, getNodeRenderer(mode)),
                    },
                ]}
                setOnGraph={classNameIsSmall}
                edges={ev.edges}
                vertices={ev.vertices}
            />
            <div className="TraceGraph--sidebar-container" style={{paddingTop: '70px'}}>
                <ul className="TraceGraph--menu bordered">
                    <li>
                         <IconButton><FaQuestion onClick={_showHelp} opacity="0.6"/></IconButton>
                    </li>
                    <li>
                        <Tooltip placement="left" title="Service">
                            <Button
                                className="TraceGraph--btn-service"
                                size="sm"
                                variant={mode === MODE_SERVICE ? 'solid' : 'outline'}
                                onClick={() => toggleNodeMode(MODE_SERVICE)}
                            >
                                S
                            </Button>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip placement="left" title="Time">
                            <Button
                                className="TraceGraph--btn-time"
                                size="sm"
                                variant={mode === MODE_TIME ? 'solid' : 'outline'}
                                onClick={() => toggleNodeMode(MODE_TIME)}
                            >
                                T
                            </Button>
                        </Tooltip>
                    </li>
                    <li>
                        <Tooltip placement="left" title="Selftime">
                            <Button
                                className="TraceGraph--btn-selftime"
                                size="sm"
                                variant={mode === MODE_SELFTIME ? 'solid' : 'outline'}
                                onClick={() => toggleNodeMode(MODE_SELFTIME)}
                            >
                                ST
                            </Button>
                        </Tooltip>
                    </li>
                </ul>
                {showHelp && (
                    <Card
                        title="Help"
                    >
                        <Flex justifyContent="space-between" mb="2">
                            <Box></Box>   
                            <a onClick={closeSidebar} role="button">
                            <FaTimes />
                        </a></Flex>
                        {HELP_CONTENT}
                    </Card>
                )}
            </div>
        </Box>
    );
}


export default TraceGraph