// Copyright (c) 2017 Uber Technologies, Inc.
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

import React from 'react';

import SpanDetail from './SpanDetail/index';
import DetailState from './SpanDetail/DetailState';
import SpanTreeOffset from './SpanTreeOffset';
import TimelineRow from '../TimelineRow';

import { SpanLog, TraceSpan, KeyValuePair, SpanLink } from 'types/plugins/trace';
import { Box, useColorMode, useColorModeValue } from '@chakra-ui/react';
import customColors from 'src/theme/colors';


type SpanDetailRowProps = {
    color: string;
    columnDivision: number;
    detailState: DetailState;
    onDetailToggled: (spanID: string) => void;
    linksGetter: (span: TraceSpan, links: KeyValuePair[], index: number) => SpanLink[];
    logItemToggle: (spanID: string, log: SpanLog) => void;
    logsToggle: (spanID: string) => void;
    processToggle: (spanID: string) => void;
    referencesToggle: (spanID: string) => void;
    warningsToggle: (spanID: string) => void;
    span: TraceSpan;
    tagsToggle: (spanID: string) => void;
    traceStartTime: number;
    focusSpan: (uiFind: string) => void;
    hoverIndentIds: Set<string>;
    addHoverIndentId: (spanID: string) => void;
    removeHoverIndentId: (spanID: string) => void;
};

const SpanDetailRow = (props: SpanDetailRowProps) => {
    const {colorMode} = useColorMode()
    const _detailToggle = () => {
        props.onDetailToggled(props.span.spanID);
    };

    const _linksGetter = (items: KeyValuePair[], itemIndex: number) => {
        const { linksGetter, span } = props;
        return linksGetter(span, items, itemIndex);
    };


    const {
        color,
        columnDivision,
        detailState,
        logItemToggle,
        logsToggle,
        processToggle,
        referencesToggle,
        warningsToggle,
        span,
        tagsToggle,
        traceStartTime,
        focusSpan,
        hoverIndentIds,
        addHoverIndentId,
        removeHoverIndentId
    } = props;
    return (
        <TimelineRow className="detail-row">
            <TimelineRow.Cell width={columnDivision}>
                <SpanTreeOffset span={span} showChildrenIcon={false} hoverIndentIds={hoverIndentIds} addHoverIndentId={addHoverIndentId} removeHoverIndentId={removeHoverIndentId} />
                <span>
                    <span
                        className="detail-row-expanded-accent"
                        aria-checked="true"
                        onClick={_detailToggle}
                        role="switch"
                        style={{ borderColor: color }}
                    />
                </span>
            </TimelineRow.Cell>
            <TimelineRow.Cell width={1 - columnDivision}>
                <Box sx={{
                    '.detail-info-wrapper': {
                        background: useColorModeValue('#fff','gray.700'),
                        border: colorMode == "light" ? '1px solid #d3d3d3' : null,
                        borderTop: '3px solid',
                        padding: '0.75rem'
                    }
                }}>
                    <div className="detail-info-wrapper" style={{ borderTopColor: color }}>
                        <SpanDetail
                            detailState={detailState}
                            linksGetter={_linksGetter}
                            logItemToggle={logItemToggle}
                            logsToggle={logsToggle}
                            processToggle={processToggle}
                            referencesToggle={referencesToggle}
                            warningsToggle={warningsToggle}
                            span={span}
                            tagsToggle={tagsToggle}
                            traceStartTime={traceStartTime}
                            focusSpan={focusSpan}
                        />
                    </div>
                </Box>

            </TimelineRow.Cell>
        </TimelineRow >
    );
}

export default SpanDetailRow