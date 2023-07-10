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

import * as React from 'react';

import ReferencesButton from './ReferencesButton';
import TimelineRow from '../TimelineRow';

import SpanTreeOffset from './SpanTreeOffset';
import SpanBar from './SpanBar';
import Ticks from '../Ticks';

import { TNil } from 'types/misc';
import { TraceSpan } from 'types/plugins/trace';
import { formatDuration,ViewedBoundsFunctionType } from '../utils';
import { IoIosAlert } from 'react-icons/io';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { FaNetworkWired } from 'react-icons/fa';
import { MdOutlineUploadFile } from 'react-icons/md';


type SpanBarRowProps = {
  className?: string;
  color: string;
  columnDivision: number;
  isChildrenExpanded: boolean;
  isDetailExpanded: boolean;
  isMatchingFilter: boolean;
  onDetailToggled: (spanID: string) => void;
  onChildrenToggled: (spanID: string) => void;
  numTicks: number;
  rpc?:
    | {
        viewStart: number;
        viewEnd: number;
        color: string;
        operationName: string;
        serviceName: string;
      }
    | TNil;
  noInstrumentedServer?:
    | {
        color: string;
        serviceName: string;
      }
    | TNil;
  showErrorIcon: boolean;
  getViewedBounds: ViewedBoundsFunctionType;
  traceStartTime: number;
  span: TraceSpan;
  focusSpan: (spanID: string) => void;
  hoverIndentIds: Set<string>;
  addHoverIndentId: (spanID: string) => void;
  removeHoverIndentId: (spanID: string) => void;
};

/**
 * This was originally a stateless function, but changing to a PureComponent
 * reduced the render time of expanding a span row detail by ~50%. This is
 * even true in the case where the stateless function has the same prop types as
 * this class and arrow functions are created in the stateless function as
 * handlers to the onClick props. E.g. for now, the PureComponent is more
 * performance than the stateless function.
 */
export default class SpanBarRow extends React.PureComponent<SpanBarRowProps> {
  static defaultProps = {
    className: '',
    rpc: null,
  };

  _detailToggle = () => {
    this.props.onDetailToggled(this.props.span.spanID);
  };

  _childrenToggle = () => {
    this.props.onChildrenToggled(this.props.span.spanID);
  };

  render() {
    const {
      className,
      color,
      columnDivision,
      isChildrenExpanded,
      isDetailExpanded,
      isMatchingFilter,
      numTicks,
      rpc,
      noInstrumentedServer,
      showErrorIcon,
      getViewedBounds,
      traceStartTime,
      span,
      focusSpan,
      hoverIndentIds,
      addHoverIndentId,
      removeHoverIndentId
    } = this.props;
    const {
      duration,
      hasChildren: isParent,
      operationName,
      process: { serviceName },
    } = span;
    const label = formatDuration(duration);
    const viewBounds = getViewedBounds(span.startTime, span.startTime + span.duration);
    const viewStart = viewBounds.start;
    const viewEnd = viewBounds.end;

    const labelDetail = `${serviceName}::${operationName}`;
    let longLabel;
    let hintSide;
    if (viewStart > 1 - viewEnd) {
      longLabel = `${labelDetail} | ${label}`;
      hintSide = 'left';
    } else {
      longLabel = `${label} | ${labelDetail}`;
      hintSide = 'right';
    }

    return (
      <TimelineRow
        className={`
          span-row
          ${className || ''}
          ${isDetailExpanded ? 'is-expanded' : ''}
          ${isMatchingFilter ? 'is-matching-filter' : ''}
        `}
      >
        <TimelineRow.Cell className="span-name-column" width={columnDivision}>
          <div className={`span-name-wrapper ${isMatchingFilter ? 'is-matching-filter' : ''}`}>
            <SpanTreeOffset
              childrenVisible={isChildrenExpanded}
              span={span}
              onClick={isParent ? this._childrenToggle : undefined}
              hoverIndentIds={hoverIndentIds} 
              addHoverIndentId={addHoverIndentId} 
              removeHoverIndentId={removeHoverIndentId}
            />
            <a
              className={`span-name ${isDetailExpanded ? 'is-detail-expanded' : ''}`}
              aria-checked={isDetailExpanded}
              onClick={this._detailToggle}
              role="switch"
              style={{ borderColor: color }}
              tabIndex={0}
            >
              <span
                className={`span-svc-name ${isParent && !isChildrenExpanded ? 'is-children-collapsed' : ''}`}
              >
                {showErrorIcon && <IoIosAlert className="SpanBarRow--errorIcon" />}
                {serviceName}{' '}
                {rpc && (
                  <span>
                    <AiOutlineArrowRight />{' '}
                    <i className="SpanBarRow--rpcColorMarker" style={{ background: rpc.color }} />
                    {rpc.serviceName}
                  </span>
                )}
                {noInstrumentedServer && (
                  <span>
                    <AiOutlineArrowRight />{' '}
                    <i
                      className="SpanBarRow--rpcColorMarker"
                      style={{ background: noInstrumentedServer.color }}
                    />
                    {noInstrumentedServer.serviceName}
                  </span>
                )}
              </span>
              <small className="endpoint-name">{rpc ? rpc.operationName : operationName}</small>
            </a>
            {span.references && span.references.length > 1 && (
              <ReferencesButton
                references={span.references}
                tooltipText="Contains multiple references"
                focusSpan={focusSpan}
              >
                <FaNetworkWired />
              </ReferencesButton>
            )}
            {span.subsidiarilyReferencedBy && span.subsidiarilyReferencedBy.length > 0 && (
              <ReferencesButton
                references={span.subsidiarilyReferencedBy}
                tooltipText={`This span is referenced by ${
                  span.subsidiarilyReferencedBy.length === 1 ? 'another span' : 'multiple other spans'
                }`}
                focusSpan={focusSpan}
              >
                <MdOutlineUploadFile />
              </ReferencesButton>
            )}
          </div>
        </TimelineRow.Cell>
        <TimelineRow.Cell
          className="span-view"
          style={{ cursor: 'pointer' }}
          width={1 - columnDivision}
          onClick={this._detailToggle}
        >
          <Ticks numTicks={numTicks} />
          <SpanBar
            rpc={rpc}
            viewStart={viewStart}
            viewEnd={viewEnd}
            getViewedBounds={getViewedBounds}
            color={color}
            shortLabel={label}
            longLabel={longLabel}
            hintSide={hintSide}
            traceStartTime={traceStartTime}
            span={span}
          />
        </TimelineRow.Cell>
      </TimelineRow>
    );
  }
}
