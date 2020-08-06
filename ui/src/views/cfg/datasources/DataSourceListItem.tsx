import React, { PureComponent } from 'react';
import {Link} from 'react-router-dom';
import { DataSourceSettings } from 'src/packages/datav-core';
import { Tag } from 'antd';
import { FormattedMessage } from 'react-intl';




export interface Props {
  dataSource: DataSourceSettings;
} 

export class DataSourceListItem extends PureComponent<Props> {
  render() {
    const { dataSource } = this.props;
    return (
      <li className="card-item-wrapper">
        <Link className="card-item" to={`/datasources/edit/${dataSource.id}`}>
          <div className="card-item-header">
            <div className="card-item-type">{dataSource.type}</div>
          </div>
          <div className="card-item-body">
            <figure className="card-item-figure">
              <img src={dataSource.typeLogoUrl} alt={dataSource.name} />
            </figure>
            <div className="card-item-details">
              <div className="card-item-name">
                <span>{dataSource.name}</span>
                {dataSource.isDefault && <Tag style={{marginLeft: '8px'}}><FormattedMessage id="common.default"/></Tag>}
              </div>
              <div className="card-item-sub-name">{dataSource.url}</div>
            </div>
          </div>
        </Link>
      </li>
    );
  }
}

export default DataSourceListItem;
