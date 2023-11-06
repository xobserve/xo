// Copyright 2023 xObserve.io Team
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

import EmphasizedNode from "../common/EmphasizedNode";
import { TLayoutVertex } from "../plexus/lib/types";
import './renderNode.css'
import * as React from 'react';
import cx from 'classnames';

import { TDiffCounts } from '../../model/trace-dag/types';
import TDagPlexusVertex from '../../model/trace-dag/types/TDagPlexusVertex';

import { FaCopy, FaInfoCircle } from "react-icons/fa";
import { chakra, Box, Divider, Flex, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, StackDivider, Text, VStack, Tooltip, Button, Textarea } from "@chakra-ui/react";
import { Portal } from "src/components/portal/Portal";
import { formatDuration } from "utils/date";
import { isErrorTag } from "../../utils/trace";
import CodeEditor from "src/components/CodeEditor/CodeEditor";
import { cloneDeep } from "lodash";

type Props = {
    a: number;
    b: number;
    operation: string;
    service: string;
    dataA: any
    dataB: any
};

const abs = Math.abs;
const max = Math.max;

export class DiffNode extends React.PureComponent<Props> {
    render() {
        const { a, b, operation, service, dataA, dataB } = this.props;
        const isSame = a === b;
        const className = cx({
            'is-same': isSame,
            'is-changed': !isSame,
            'is-more': b > a && a > 0,
            'is-added': a === 0,
            'is-less': a > b && b > 0,
            'is-removed': b === 0,
        });
        const chgSign = a < b ? '+' : '-';
        const table = (
            <table className={`DiffNode ${className}`} style={{ fontSize: "1.4rem" }}>
                <tbody className="DiffNode--body">
                    <tr>
                        <td className={`DiffNode--metricCell ${className}`} rowSpan={isSame ? 2 : 1}>
                            {isSame ? null : <span className="DiffNode--metricSymbol">{chgSign}</span>}
                            {isSame ? a : abs(b - a)}
                        </td>
                        <td className={`DiffNode--labelCell ${className}`}>
                            <strong>{service}</strong>
                            {/* <CopyToClipboard copyText={`${service} ${operation}`}
                                tooltipTitle="Copy label" /> */}
                        </td>
                    </tr>
                    <tr>
                        {isSame ? null : (
                            <td className={`DiffNode--metricCell ${className}`}>
                                <span className="DiffNode--metricSymbol">{chgSign}</span>
                                {a === 0 || b === 0 ? 100 : abs(((a - b) / max(a, b)) * 100).toFixed(0)}
                                <span className="DiffNode--metricSymbol">%</span>
                            </td>
                        )}
                        <td className={`DiffNode--labelCell ${className}`}>{operation}</td>
                    </tr>
                </tbody>
            </table>
        );

        return (
            <Popover trigger="hover" openDelay={200} placement="auto">
                <PopoverTrigger>
                    {table}
                </PopoverTrigger>
                <Portal>
                    <PopoverContent minWidth="800px">
                        <PopoverArrow />
                        <PopoverBody>
                            <HStack spacing={4} divider={<StackDivider />} alignItems="top" maxH="400px" overflowY="auto">
                                {dataA?.length > 0 && <Box width="50%"><NodeCard service={service} operation={operation} data={dataA} data1={dataB} /></Box>}
                                {dataB?.length > 0 && <Box width="50%"><NodeCard service={service} operation={operation} data={dataB} data1={dataA} /></Box>}
                            </HStack>
                        </PopoverBody>
                    </PopoverContent>
                </Portal>
            </Popover>

        );
    }
}

export default function renderNode(vertex: TDagPlexusVertex<TDiffCounts>) {
    const { a, b, operation, service } = vertex.data;

    const lenA = a ? a.length : 0;
    const lenB = b ? b.length : 0;
    return <DiffNode a={lenA} b={lenB} operation={operation} service={service} dataA={a} dataB={b} />;
}

export function getNodeEmphasisRenderer(keys: Set<string>) {
    return function drawEmphasizedNode(lv: TLayoutVertex<any>) {
        if (!keys.has(lv.vertex.key)) {
            return null;
        }
        return <EmphasizedNode height={lv.height} width={lv.width} />;
    };
}

const NodeCard = ({ service, operation, data, data1 }) => {
    const [activeSpan, setActiveSpan] = React.useState(null)
    const [inView, setInView] = React.useState(null)
    const viewSpan = (span) => {
        const s = cloneDeep(span.span)
        delete(s.references)
        return JSON.stringify(s, null, 1)
    }
    
    return (
        <>

            <Flex fontSize="1rem" justifyContent="space-between" alignItems="center">
                <HStack>
                    <Text>{service}:</Text>
                    <Text>{operation}</Text>
                </HStack>
                <Text fontSize="0.8rem" opacity="0.7">{data[0].span.traceID.slice(0, 7)}</Text>
            </Flex>
            <Text fontSize="0.9rem" opacity="0.8" mt="1">Spans numbers: <chakra.span color="brand.500" fontWeight="600">{data.length}</chakra.span></Text>
            <Divider mt="2" />
            <VStack alignItems="left" mt="2" divider={<StackDivider />} fontSize="0.8rem" >
                {
                    data.map((span, i) => <Box>
                        <Flex justifyContent="space-between" alignItems="center" onMouseEnter={() => setActiveSpan(span)} onMouseLeave={() => setActiveSpan(null)}>
                            <Box>
                                <HStack>
                                    <Text>Span ID: {span.id} </Text>
                                    {span.span.tags.some(isErrorTag) && <Tooltip label="There is a error in this span, click to see details"><Box><FaInfoCircle color="red" /></Box></Tooltip>}
                                </HStack>
                                <Text>Duration: <chakra.span color={span.span.duration > (data1 ? data1[i]?.span.duration: 0) ? "orange" : "inherit"} fontWeight="600">{formatDuration(span.span.duration)}</chakra.span></Text>
                            </Box>

                            {activeSpan?.id == span.id && <Button size="xs" variant="ghost" onClick={() => setInView(inView != span.id ? span.id : null)}>{inView != span.id ? "View detail" : "Hide detail"} </Button>}
                        </Flex>
                        {inView == span.id && <Box height="300px">
                            <CodeEditor fontSize={8}  value={viewSpan(span)} readonly></CodeEditor>
                        </Box>}
                    </Box>)

                }
            </VStack>
        </>
    )
}

