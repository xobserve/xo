import React from 'react';
import { Col, Divider, Row, Tag } from 'antd';
import './index.less';
import ResultItemTitle from './Title';
import moment from 'moment';
import { KeyValuePair } from 'src/types';
import { formatRelativeDate } from 'src/core/library/utils/date';
import colorGenerator from 'src/core/library/utils/color-generator';
import { sortBy } from 'lodash';

const isErrorTag = ({ key, value }: KeyValuePair) => key === 'error' && (value === true || value === 'true');
function Index(props: any) {
    const {
        trace,
        durationPercent,
    } = props;
    const { duration, services, startTime, spans, traceName, traceID } = trace;
    const mDate = moment(startTime / 1000);
    const timeStr = mDate.format('h:mm:ss a');
    const fromNow = mDate.fromNow();
    const numSpans = spans.length;
    const numErredSpans = spans.filter((sp: any) => sp.tags.some(isErrorTag)).length;
    
    return (
        <div className="trace-result-item"> 
            <ResultItemTitle
                duration={duration}
                durationPercent={durationPercent}
                traceID={traceID}
                traceName={traceName}
            />

            {/* <a href={`/t/${traceID}?datasource=${datasource}`} target="_blank"> */}
                <Row>
                    <Col span={4} className="ub-p2">
                        <Tag className="ub-m1">
                            {numSpans} Span{numSpans > 1 && 's'}
                        </Tag>
                        {Boolean(numErredSpans) && (
                            <Tag className="ub-m1" color="red">
                                {numErredSpans} Error{numErredSpans > 1 && 's'}
                            </Tag>
                        )}
                    </Col>
                    <Col span={14} className="ub-p2">
                        <ul className="ub-list-reset" >
                            {sortBy(services, (s:any) => s.name).map((service:any) => {
                                const { name, numberOfSpans: count } = service;
                                return (
                                    <li key={name} className="ub-inline-block ub-m1">
                                        <Tag
                                            className="ResultItem--serviceTag"
                                            style={{ borderLeftColor: colorGenerator.getColorByKey(name) }}
                                        >
                                            {name} ({count})
                      </Tag>
                                    </li>
                                );
                            })} 
                        </ul>
                    </Col>
                    <Col span={6} className="ub-p3 ub-tx-right-align">
                        {formatRelativeDate(startTime / 1000)}
                        <Divider type="vertical" />
                        {timeStr.slice(0, -3)}&nbsp;{timeStr.slice(-2)}
                        <br />
                        <small>{fromNow}</small>
                    </Col>
                </Row>
            {/* </a> */}
        </div>
    );
}

let ResultItem = Index

export default ResultItem;
