import React, { Component } from 'react';
import _ from 'lodash'
import { PanelProps, PanelData } from 'src/packages/datav-core/src';
import { Options } from './types';
import { css } from 'emotion';
import { Row, Col, Tooltip } from 'antd';



interface Props extends PanelProps<Options> {

}

export class InfoTable extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  transformData = (data: PanelData) => {
    const newData = []
    if (data.series.length > 0) {
      for (const frame of data.series[0].fields) {
        const value = frame.values.toArray()
        if (value.length > 0) {
          newData.push({
            name: frame.name,
            value: value[0]
          })
        }
      }
    }

    return newData
  }

  render() {
    const { data, height, width } = this.props;
    const newData = this.transformData(data)
    console.log(newData)
    const count = newData.length;

    if (!count || count < 1) {
      return <div>No data</div>;
    }

    if (count >= 1) {
      return (
        <Row className={tableStyles.wrapper}>
          {
            newData.map(item => {
              let value:string = ""
              let tooltip:string = null
              if (_.isString(item.value)) {
                value = item.value
              } else {
                if (item.value.length === 2) {
                  value = item.value[0]
                  tooltip = item.value[1]
                } 
              }
              return <Col span="12" key={item.name} style={{padding: '4px 0'}}>
                <Row>
                <Col span="6" className={tableStyles.itemName}>
                  {item.name}
                </Col>
                <Col  span="12" className={tableStyles.itemValue}>
                  {tooltip ? <Tooltip title={<div dangerouslySetInnerHTML={{__html: tooltip}}></div>} className="color-success pointer">{value}</Tooltip> : value}
                </Col>
                </Row>
              </Col>
            })
          }
        </Row>
      );
    }
  }
}

const tableStyles = {
  wrapper: css`
    padding: 10px 40px
  `,
  itemName: css`
    font-weight: 500;
  `,
  itemValue: css`
  `,
};
