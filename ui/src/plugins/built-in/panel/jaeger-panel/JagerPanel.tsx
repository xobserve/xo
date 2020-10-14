import React, { PureComponent } from 'react';
import _ from 'lodash'
import memoizeOne from 'memoize-one';
import { PanelProps, withTheme, DatavTheme } from 'src/packages/datav-core';
import { SimpleOptions,Trace } from './types';
import { css, cx } from 'emotion';
import { stylesFactory } from 'src/packages/datav-core';
import { getDatasourceSrv } from 'src/core/services/datasource';
import { Form, Input, Button, Select, Row, Col,notification} from 'antd';
import { values } from 'lodash';
import ScatterPlot from './ScatterPlot/ScatterPlot';
import transformTraceData from './transformTraceData'
import { getPercentageOfDuration } from 'src/core/library/utils/date';
import ResultItem from './ResultItem'
import { localeStringComparator } from 'src/core/library/utils/sort';
import {sortTraces , LEAST_SPANS, LONGEST_FIRST, MOST_RECENT, MOST_SPANS, SHORTEST_FIRST} from './sortTraces'

const { Option } = Select;
const maxTraceDuration = 814199

interface Props extends PanelProps<SimpleOptions> {
  theme: DatavTheme
}

interface State {
  services: string[]
  operations: string[]
  traces: Trace[]
}

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
  };
});
const styles = getStyles();

class JaegerPanel extends PureComponent<Props, State> {
  sortBy = MOST_RECENT
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.setState({
      services: [],
      operations: ['all'],
      traces: []
    })
  }

  async componentDidMount() {
    // get services from jaeger datasource
    const ds = await getDatasourceSrv().get(this.props.panel.datasource)
    //@ts-ignore
    const res = await ds.findServices()
    const services: string[] = res.data.data 
    services.sort(localeStringComparator)
    this.setState({
      ...this.state,
      services: res.data.data
    })
  }

  onServiceChange = async (srv) => {
    // get operations from jaeger datasource
    const ds = await getDatasourceSrv().get(this.props.panel.datasource)

    //@ts-ignore
    const operations: string[] = await ds.findOperations(srv)
    operations.sort(localeStringComparator)
    operations.unshift('all')
    this.setState({
      ...this.state,
      operations
    })
  }

  sortedTracesXformer = memoizeOne((traces) => {
    const traceResults = traces.slice();
    sortTraces(traceResults, this.sortBy);
    return traceResults;
  });

  findTraces = async (options: any) => {
    if (!options.service) {
      notification['error']({
        message: "Error",
        description: 'Select a serivce first',
        duration: 5
      });
      return 
    }

    if (options.tags.trim() === '') {
      delete(options['tags'])
    }

    if (options.operation === 'all') {
      delete(options['operation'])
    }
    // get traces from jaeger datasource
    // get operations from jaeger datasource
    const ds = await getDatasourceSrv().get(this.props.panel.datasource)

    //@ts-ignore
    const rawTraces = await ds.findTraces(options)
    const traces = []
    for (const rawTrace of rawTraces) {
      const trace = transformTraceData(rawTrace)
      traces.push(trace)
    }

    const traceResults = this.sortedTracesXformer(traces)
    this.setState({
      ...this.state,
      traces:traceResults
    })
  };

  changeSort = (sort) => {
    this.sortBy = sort 
    const traces = _.cloneDeep(this.state.traces)
    const traceResults = this.sortedTracesXformer(traces)
    this.setState({
      ...this.state,
      traces: traceResults
    })
  }

  render() {
    const { options, data, width, height, theme } = this.props;

    if (!this.state) {
      return null
    }
    const { services, operations,traces} = this.state
    let srvOptions = services.map(srv => <Option value={srv} key={srv}>{srv}</Option>);
    let opOptions = operations.map(op => <Option value={op} key={op}>{op}</Option>)

    const resultListHeight = height - 280
    return (
      <Row className={cx(styles.wrapper, css`width: ${width}px;height: ${height}px;`)}>
        <Col span="6">
          <Form
            name="basic"
            onFinish={this.findTraces}
            layout="vertical"
            style={{ padding: '10px' }}
            // size="small"
            initialValues={{
              'limit': 20,
              'operation': 'all',
              'minDuration': '',
              'maxDuration': '',
              'tags': ''
            }}
          >
            <Form.Item
              label="Service"
              name="service"
            >
              <Select
                placeholder="Select a service"
                onChange={this.onServiceChange}
              >
                {srvOptions}
              </Select>
            </Form.Item>

            <Form.Item
              label="Operations"
              name="operation"
            >
              <Select
                placeholder="Select an operation"
              >
                {opOptions}
              </Select>
            </Form.Item>

            <Form.Item
              label="Tags"
              name="tags"
            >
              <Input placeholder="http.status_code=200 error=true" />
            </Form.Item>

            <Form.Item
              label="Min Duration"
              name="minDuration"
            >
              <Input placeholder="e.g. 1.2s, 100ms, 500us" />
            </Form.Item>

            <Form.Item
              label="Max Duration"
              name="maxDuration"
            >
              <Input placeholder="e.g. 1.2s, 100ms, 500us" />
            </Form.Item>

            <Form.Item
              label="Limit Results"
              name="limit"
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" ghost>
                Submit
                </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span="16" offset="1">
          {traces.length > 0 && <div>
            <ScatterPlot
                data={traces.map(t => ({
                  x: t.startTime,
                  y: t.duration,
                  traceID: t.traceID,
                  size: t.spans.length,
                  name: t.traceName,
                }))}
                onValueClick={t => {
                  // goToTrace(t.traceID);
                }}
              />
              <div className="trace-search-overview">
                        <h2>
                            {traces.length} Trace{traces.length > 1 && 's'}
                        </h2>
                        <div>
                            <span className="ub-mr2">Sort:</span>
                            <Select
                                placeholder="Please select"
                                defaultValue={MOST_RECENT}
                                onChange={this.changeSort}
                            >
                                <Option value={MOST_RECENT}>Most Recent</Option>
                                <Option value={LONGEST_FIRST}>Longest First</Option>
                                <Option value={SHORTEST_FIRST}>Shortest First</Option>
                                <Option value={MOST_SPANS}>Most Spans</Option>
                                <Option value={LEAST_SPANS}>Least Spans</Option>
                            </Select>
                        </div>

                    </div>

                    <ul className="ub-list-reset" style={{height: resultListHeight + 'px', overflowY: 'scroll'}}>
                        {traces.map(trace => (
                        <li className="ub-my3 ub-pl3 ub-pr3" key={trace.traceID}>
                            <ResultItem
                            durationPercent={getPercentageOfDuration(trace.duration, maxTraceDuration)}
                            trace={trace}
                            />
                        </li>
                        ))}
                    </ul>
                    </div>}
        </Col>
      </Row>
    );
  }
};

export default withTheme(JaegerPanel)


