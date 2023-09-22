import React, { memo, useState } from "react";
import cx from 'classnames';
import { TNil } from "types/misc";
import { Accessors } from "../scroll/scrollManager";
import { KeyValuePair, Trace, TraceSpan } from "types/plugins/trace";
import DetailState from "./SpanRow/SpanDetail/DetailState";
import memoizeOne from 'memoize-one';
import spanAncestorIds, { ViewedBoundsFunctionType, createViewedBoundsFunc, findServerChildSpan, isErrorSpan, isKindClient, spanContainsErredSpan } from "./utils";
import { isEmpty, isEqual } from "lodash";
import { Box } from "@chakra-ui/react";
import ListView from "./ListView/ListView";
import getLinks from "../../../model/link-patterns";
import colorGenerator from "utils/colorGenerator";
import SpanBarRow from "./SpanRow/SpanBarRow";
import { PEER_SERVICE } from "../../../config/constants";
import SpanDetailRow from "./SpanRow/SpanDetailRow";
import filterSpans from "../../../utils/filter-spans";

interface Props {
    currentViewRangeTime: [number, number];
    findMatchesIDs: Set<string> | TNil;
    scrollToFirstVisibleSpan: () => void;
    registerAccessors: (accesors: Accessors) => void;
    trace: Trace;
    spanNameWidth: number
    search: string
    childrenHiddenIDs: Set<string>
    onChildrenToggle: any
};

const memoizedGenerateRowStates = memoizeOne(generateRowStatesFromTrace);
const memoizedViewBoundsFunc = memoizeOne(createViewedBoundsFunc, isEqual);
const memoizedGetCssClasses = memoizeOne(getCssClasses, isEqual);


type State = {
    detailStates: Map<string, DetailState>;
    hoverIndentGuideIds: Set<string>;
    shouldScrollToFirstUiFindMatch: boolean;
};

const SpanRowsWrapper = memo((props: Props) => {
    console.log("here333333:span rows renders")
    return (
        <SpanRows {...props} />
    )
})

export default SpanRowsWrapper

export class SpanRows extends React.Component<Props> {
    listView: ListView | TNil;
    //@ts-ignore
    state: State;
    constructor(props: Props) {
        super(props);
        const {
            // setTrace,
            trace, search } = props;

        if (!isEmpty(search)) {
            const {
                childrenHiddenIDs,
                detailStates,
                shouldScrollToFirstUiFindMatch,
            } = calculateFocusedFindRowStates(search, trace.spans)
            this.state = { hoverIndentGuideIds: new Set(), detailStates, shouldScrollToFirstUiFindMatch }
            props.onChildrenToggle(childrenHiddenIDs)
        } else {
            this.state = {
                detailStates: new Map(),
                hoverIndentGuideIds: new Set(),
                shouldScrollToFirstUiFindMatch: false,
            }
        }
    }



    shouldComponentUpdate(nextProps: Props, nextStates: State) {
        for (const [key, value] of Object.entries(nextStates)) {
            if (value !== this.state[key]) {
                if (key == 'shouldScrollToFirstUiFindMatch') {
                    if (value) return true;
                    return false
                }
            } else {
                return true
            }
        }


        // If any prop updates, VirtualizedTraceViewImpl should update.
        const nextPropKeys = Object.keys(nextProps) as (keyof Props)[];
        for (let i = 0; i < nextPropKeys.length; i += 1) {
            if (nextProps[nextPropKeys[i]] !== this.props[nextPropKeys[i]]) {
                return true;
            }
        }

        return false;
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        const { registerAccessors } = prevProps;
        const {
            scrollToFirstVisibleSpan,
            registerAccessors: nextRegisterAccessors,
        } = this.props;

        if (this.listView && registerAccessors !== nextRegisterAccessors) {
            nextRegisterAccessors(this.getAccessors());
        }

        if (this.state.shouldScrollToFirstUiFindMatch) {
            scrollToFirstVisibleSpan();
            this.clearShouldScrollToFirstUiFindMatch();
        }
    }

    clearShouldScrollToFirstUiFindMatch = () => {
        this.setState({
            ...this.state,
            shouldScrollToFirstUiFindMatch: false,
        });
    }

    addHoverIndentId = (spanID) => {
        const newIds = new Set();
        newIds.add(spanID);
        this.setState({
            ...this.state,
            hoverIndentGuideIds: newIds,
        });
    }

    removeHoverIndentId = (spanID) => {
        const newIds = new Set(this.state.hoverIndentGuideIds);
        newIds.delete(spanID);
        this.setState({
            ...this.state,
            hoverIndentGuideIds: newIds,
        });
    }

    childrenToggle = (spanID) => {
        const childrenHiddenIDs = new Set(this.props.childrenHiddenIDs);
        if (childrenHiddenIDs.has(spanID)) {
            childrenHiddenIDs.delete(spanID);
        } else {
            childrenHiddenIDs.add(spanID);
        }

        this.props.onChildrenToggle(childrenHiddenIDs)
    }

    detailToggle = (spanID) => {
        const detailStates = new Map(this.state.detailStates);
        if (detailStates.has(spanID)) {
            detailStates.delete(spanID);
        } else {
            detailStates.set(spanID, new DetailState());
        }
        this.setState({
            ...this.state,
            detailStates,
        });
    }

    detailLogItemToggle = (spanID, logItem) => {
        const old = this.state.detailStates.get(spanID);
        if (!old) {
            return
        }
        const detailState = old.toggleLogItem(logItem);
        const detailStates = new Map(this.state.detailStates);
        detailStates.set(spanID, detailState);

        this.setState({
            ...this.state,
            detailStates,
        });
    }

    commonDetailToggle = (
        type: 'tags' | 'process' | 'logs' | 'warnings' | 'references',
        spanID
    ) => {
        const old = this.state.detailStates.get(spanID);
        if (!old) {
            return
        }
        let detailState = new DetailState(old)
        if (type === 'tags') {
            detailState.isTagsOpen = !old.isTagsOpen;
        } else if (type === 'process') {
            detailState.isProcessOpen = !old.isProcessOpen;
        } else if (type === 'warnings') {
            detailState.isWarningsOpen = !old.isWarningsOpen;
        } else if (type === 'references') {
            detailState.isReferencesOpen = !old.isReferencesOpen;
        } else {
            detailState.logs.isOpen = !old.logs.isOpen;
        }
        const detailStates = new Map(this.state.detailStates);
        detailStates.set(spanID, detailState);
        this.setState({
            ...this.state,
            detailStates,
        });
    }

    getRowStates = (): RowState[] => {
        return memoizedGenerateRowStates(this.props.trace, this.props.childrenHiddenIDs, this.state.detailStates);
    }

    getClippingCssClasses = (): string => {
        const { currentViewRangeTime } = this.props;
        return memoizedGetCssClasses(currentViewRangeTime);
    }

    getViewedBounds = (): ViewedBoundsFunctionType => {
        const { currentViewRangeTime, trace } = this.props;
        const [zoomStart, zoomEnd] = currentViewRangeTime;

        return memoizedViewBoundsFunc({
            min: trace.startTime,
            max: trace.endTime,
            viewStart: zoomStart,
            viewEnd: zoomEnd,
        });
    }

    focusSpan = (uiFind: string) => {
        // const { trace, focusUiFindMatches, location, history } = this.props;
        // if (trace) {
        //     updateUiFind({
        //         location,
        //         history,
        //         uiFind,
        //     });
        //     focusUiFindMatches(trace, uiFind, false);
        // }
    };

    getAccessors = () => {
        const lv = this.listView;
        if (!lv) {
            throw new Error('ListView unavailable');
        }
        return {
            getViewRange: this.getViewRange,
            getSearchedSpanIDs: this.getSearchedSpanIDs,
            getCollapsedChildren: this.getCollapsedChildren,
            getViewHeight: lv.getViewHeight,
            getBottomRowIndexVisible: lv.getBottomVisibleIndex,
            getTopRowIndexVisible: lv.getTopVisibleIndex,
            getRowPosition: lv.getRowPosition,
            mapRowIndexToSpanIndex: this.mapRowIndexToSpanIndex,
            mapSpanIndexToRowIndex: this.mapSpanIndexToRowIndex,
        };
    }

    getViewRange = () => this.props.currentViewRangeTime;

    getSearchedSpanIDs = () => this.props.findMatchesIDs;

    getCollapsedChildren = () => this.props.childrenHiddenIDs;

    mapRowIndexToSpanIndex = (index: number) => this.getRowStates()[index].spanIndex;

    mapSpanIndexToRowIndex = (index: number) => {
        const max = this.getRowStates().length;
        for (let i = 0; i < max; i++) {
            const { spanIndex } = this.getRowStates()[i];
            if (spanIndex === index) {
                return i;
            }
        }
        throw new Error(`unable to find row for span index: ${index}`);
    };

    setListView = (listView: ListView | TNil) => {
        const isChanged = this.listView !== listView;
        this.listView = listView;
        if (listView && isChanged) {
            this.props.registerAccessors(this.getAccessors());
        }
    };

    // use long form syntax to avert flow error
    // https://github.com/facebook/flow/issues/3076#issuecomment-290944051
    getKeyFromIndex = (index: number) => {
        const { isDetail, span } = this.getRowStates()[index];
        return `${span.spanID}--${isDetail ? 'detail' : 'bar'}`;
    };

    getIndexFromKey = (key: string) => {
        const parts = key.split('--');
        const _spanID = parts[0];
        const _isDetail = parts[1] === 'detail';
        const max = this.getRowStates().length;
        for (let i = 0; i < max; i++) {
            const { span, isDetail } = this.getRowStates()[i];
            if (span.spanID === _spanID && isDetail === _isDetail) {
                return i;
            }
        }
        return -1;
    };

    getRowHeight = (index: number) => {
        const { span, isDetail } = this.getRowStates()[index];
        if (!isDetail) {
            return DEFAULT_HEIGHTS.bar;
        }
        if (Array.isArray(span.logs) && span.logs.length) {
            return DEFAULT_HEIGHTS.detailWithLogs;
        }
        return DEFAULT_HEIGHTS.detail;
    };

    linksGetter = (span: TraceSpan, items: KeyValuePair[], itemIndex: number) => {
        const { trace } = this.props;
        return getLinks(span, items, itemIndex, trace);
    };

    renderRow = (key: string, style: React.CSSProperties, index: number, attrs: {}) => {
        const { isDetail, span, spanIndex } = this.getRowStates()[index];
        return isDetail
            ? this.renderSpanDetailRow(span, key, style, attrs)
            : this.renderSpanBarRow(span, spanIndex, key, style, attrs);
    };

    renderSpanBarRow = (span: TraceSpan, spanIndex: number, key: string, style: React.CSSProperties, attrs: {}) => {
        const { spanID } = span;
        const { serviceName } = span.process;
        const {
            findMatchesIDs,
            spanNameWidth,
            trace,
            childrenHiddenIDs
        } = this.props;
        const {
            detailStates,
        } = this.state
        // to avert flow error
        if (!trace) {
            return null;
        }
        const color = colorGenerator.getColorByKey(serviceName);
        const isCollapsed = childrenHiddenIDs.has(spanID);
        const isDetailExpanded = detailStates.has(spanID);
        const isMatchingFilter = findMatchesIDs ? findMatchesIDs.has(spanID) : false;
        const showErrorIcon = isErrorSpan(span) || (isCollapsed && spanContainsErredSpan(trace.spans, spanIndex));

        // Check for direct child "server" span if the span is a "client" span.
        let rpc = null;
        if (isCollapsed) {
            const rpcSpan = findServerChildSpan(trace.spans.slice(spanIndex));
            if (rpcSpan) {
                const rpcViewBounds = this.getViewedBounds()(rpcSpan.startTime, rpcSpan.startTime + rpcSpan.duration);
                rpc = {
                    color: colorGenerator.getColorByKey(rpcSpan.process.serviceName),
                    operationName: rpcSpan.operationName,
                    serviceName: rpcSpan.process.serviceName,
                    viewEnd: rpcViewBounds.end,
                    viewStart: rpcViewBounds.start,
                };
            }
        }
        const peerServiceKV = span.tags.find(kv => kv.key === PEER_SERVICE);
        // Leaf, kind == client and has peer.service tag, is likely a client span that does a request
        // to an uninstrumented/external service
        let noInstrumentedServer = null;
        if (!span.hasChildren && peerServiceKV && isKindClient(span)) {
            noInstrumentedServer = {
                serviceName: peerServiceKV.value,
                color: colorGenerator.getColorByKey(peerServiceKV.value),
            };
        }

        return (
            <Box className="VirtualizedTraceView--row" width="100%" key={key} style={style} {...attrs}>
                <SpanBarRow
                    className={this.getClippingCssClasses()}
                    color={color}
                    columnDivision={spanNameWidth}
                    isChildrenExpanded={!isCollapsed}
                    isDetailExpanded={isDetailExpanded}
                    isMatchingFilter={isMatchingFilter}
                    numTicks={NUM_TICKS}
                    onDetailToggled={this.detailToggle}
                    onChildrenToggled={this.childrenToggle}
                    rpc={rpc}
                    noInstrumentedServer={noInstrumentedServer}
                    showErrorIcon={showErrorIcon}
                    getViewedBounds={this.getViewedBounds()}
                    traceStartTime={trace.startTime}
                    span={span}
                    focusSpan={this.focusSpan}
                    hoverIndentIds={this.state.hoverIndentGuideIds}
                    addHoverIndentId={this.addHoverIndentId}
                    removeHoverIndentId={this.removeHoverIndentId}
                />
            </Box>
        );
    }

    renderSpanDetailRow = (span: TraceSpan, key: string, style: React.CSSProperties, attrs: {}) => {
        const { spanID } = span;
        const { serviceName } = span.process;
        const {
            spanNameWidth,
            trace,
        } = this.props;

        const {
            detailStates
        } = this.state

        const detailState = detailStates.get(spanID);
        if (!trace || !detailState) {
            return null;
        }
        const color = colorGenerator.getColorByKey(serviceName);
        return (
            <Box className="VirtualizedTraceView--row" width="100%" key={key} style={{ ...style, zIndex: 1 }} {...attrs}>
                <SpanDetailRow
                    color={color}
                    columnDivision={spanNameWidth}
                    onDetailToggled={this.detailToggle}
                    detailState={detailState}
                    linksGetter={this.linksGetter}
                    logItemToggle={this.detailLogItemToggle}
                    logsToggle={(id) => this.commonDetailToggle("logs", id)}
                    processToggle={(id) => this.commonDetailToggle("process", id)}
                    referencesToggle={(id) => this.commonDetailToggle("references", id)}
                    warningsToggle={(id) => this.commonDetailToggle("warnings", id)}
                    tagsToggle={(id) => this.commonDetailToggle("tags", id)}
                    span={span}
                    traceStartTime={trace.startTime}
                    focusSpan={this.focusSpan}
                    hoverIndentIds={this.state.hoverIndentGuideIds}
                    addHoverIndentId={this.addHoverIndentId}
                    removeHoverIndentId={this.removeHoverIndentId}
                />
            </Box>
        );
    }

    render() {
        return (
            <Box className="VirtualizedTraceView--spans" pt="38px" width="100%" sx={{
                '.VirtualizedTraceView--rowsWrapper': {
                    width: '100%'
                }
            }}>
                <ListView
                    ref={this.setListView}
                    dataLength={this.getRowStates().length}
                    itemHeightGetter={this.getRowHeight}
                    itemRenderer={this.renderRow}
                    viewBuffer={300}
                    viewBufferMin={100}
                    itemsWrapperClassName="VirtualizedTraceView--rowsWrapper"
                    getKeyFromIndex={this.getKeyFromIndex}
                    getIndexFromKey={this.getIndexFromKey}
                    windowScroller
                />
            </Box>
        );
    }
}



type RowState = {
    isDetail: boolean;
    span: TraceSpan;
    spanIndex: number;
};

export const DEFAULT_HEIGHTS = {
    bar: 28,
    detail: 161,
    detailWithLogs: 197,
};

const NUM_TICKS = 5;

function generateRowStates(
    spans: TraceSpan[] | TNil,
    childrenHiddenIDs: Set<string>,
    detailStates: Map<string, DetailState | TNil>
): RowState[] {
    if (!spans) {
        return [];
    }
    let collapseDepth = null;
    const rowStates = [];
    for (let i = 0; i < spans.length; i++) {
        const span = spans[i];
        const { spanID, depth } = span;
        let hidden = false;
        if (collapseDepth != null) {
            if (depth >= collapseDepth) {
                hidden = true;
            } else {
                collapseDepth = null;
            }
        }
        if (hidden) {
            continue;
        }
        if (childrenHiddenIDs.has(spanID)) {
            collapseDepth = depth + 1;
        }
        rowStates.push({
            span,
            isDetail: false,
            spanIndex: i,
        });
        if (detailStates.has(spanID)) {
            rowStates.push({
                span,
                isDetail: true,
                spanIndex: i,
            });
        }
    }
    return rowStates;
}

function generateRowStatesFromTrace(
    trace: Trace | TNil,
    childrenHiddenIDs: Set<string>,
    detailStates: Map<string, DetailState | TNil>
): RowState[] {
    return trace ? generateRowStates(trace.spans, childrenHiddenIDs, detailStates) : [];
}

function getCssClasses(currentViewRange: [number, number]) {
    const [zoomStart, zoomEnd] = currentViewRange;
    return cx({
        'clipping-left': zoomStart > 0,
        'clipping-right': zoomEnd < 1,
    });
}


const calculateFocusedFindRowStates = (uiFind: string, spans: TraceSpan[], allowHide: boolean = true) => {
    const spansMap = new Map();
    const childrenHiddenIDs: Set<string> = new Set();
    const detailStates: Map<string, DetailState> = new Map();
    let shouldScrollToFirstUiFindMatch: boolean = false;

    spans.forEach(span => {
        spansMap.set(span.spanID, span);
        if (allowHide) {
            childrenHiddenIDs.add(span.spanID);
        }
    });
    const matchedSpanIds = filterSpans(uiFind, spans);
    if (matchedSpanIds && matchedSpanIds.size) {
        matchedSpanIds.forEach(spanID => {
            const span = spansMap.get(spanID);
            detailStates.set(spanID, new DetailState());
            spanAncestorIds(span).forEach(ancestorID => childrenHiddenIDs.delete(ancestorID));
        });
        shouldScrollToFirstUiFindMatch = true;
    }
    return {
        childrenHiddenIDs,
        detailStates,
        shouldScrollToFirstUiFindMatch,
    };
}