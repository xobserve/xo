// Libraries
import React, { PureComponent } from 'react';
import classNames from 'classnames';

// Components
import DataSourceListItem from './DataSourceListItem';

// Types
import { DataSourceSettings } from 'src/packages/datav-core';
 
export interface Props {
  dataSources: DataSourceSettings[];
}

export class DataSourceList extends PureComponent<Props> {
  render() {
    const { dataSources } = this.props;

    const listStyle = classNames({
      'card-section': true,
      'card-list-layout-list': true
    });

    return (
      <section className={listStyle}>
        <ol className="card-list">
          {dataSources.map((dataSource, index) => {
            return <DataSourceListItem dataSource={dataSource} key={`${dataSource.id}-${index}`} />;
          })}
        </ol>
      </section>
    );
  }
}

export default DataSourceList;
