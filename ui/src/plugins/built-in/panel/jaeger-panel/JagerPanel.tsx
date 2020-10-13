import React, { PureComponent } from 'react';
import { PanelProps, withTheme, DatavTheme } from 'src/packages/datav-core';
import { SimpleOptions,Trace } from './types';
import { css, cx } from 'emotion';
import { stylesFactory } from 'src/packages/datav-core';
import { getDatasourceSrv } from 'src/core/services/datasource';
import { Form, Input, Button, Select, Row, Col } from 'antd';
import { values } from 'lodash';
import ScatterPlot from './ScatterPlot/ScatterPlot';
import transformTraceData from './transformTraceData'

const { Option } = Select;

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
    this.setState({
      ...this.state,
      services: res.data.data
    })
  }

  onServiceChange = async (srv) => {
    // get operations from jaeger datasource
    const ds = await getDatasourceSrv().get(this.props.panel.datasource)

    //@ts-ignore
    const operations = await ds.findOperations(srv)
    this.setState({
      ...this.state,
      operations
    })
  }

  findTraces = async (options: any) => {
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

    console.log(traces)
    this.setState({
      ...this.state,
      traces
    })
  };

  render() {
    const { options, data, width, height, theme } = this.props;

    if (!this.state) {
      return null
    }
    const { services, operations,traces} = this.state
    let srvOptions = services.map(srv => <Option value={srv} key={srv}>{srv}</Option>);
    let opOptions = operations.map(op => <Option value={op} key={op}>{op}</Option>)
    return (
      <Row className={cx(styles.wrapper, css`width: ${width}px;height: ${height}px;`)}>
        <Col span="8">
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
        <Col span="12">
          {traces.length > 0 && <ScatterPlot
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
              />}
        </Col>
      </Row>
    );
  }
};

export default withTheme(JaegerPanel)


