import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Table, Select, getTheme, getHistory, getTemplateSrv } from 'src/packages/datav-core/src';
import { FieldMatcherID, PanelProps, DataFrame, SelectableValue, getFrameDisplayName } from 'src/packages/datav-core/src';
import { Options } from './types';
import { css } from 'emotion';

import { TableSortByFieldState } from 'src/packages/datav-core/src';
import { resetDashboardVariables } from 'src/views/dashboard/model/initDashboard'
import { join, indexOf,cloneDeep, isArray} from 'lodash';
import { interactive } from 'src/core/library/utils/interactive';


interface Props extends PanelProps<Options> {
  resetDashboardVariables: typeof resetDashboardVariables
}

export class TablePanelUnconnected extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  onColumnResize = (fieldDisplayName: string, width: number) => {
    const { fieldConfig } = this.props;
    const { overrides } = fieldConfig;

    const matcherId = FieldMatcherID.byName;
    const propId = 'custom.width';

    // look for existing override
    const override = overrides.find(o => o.matcher.id === matcherId && o.matcher.options === fieldDisplayName);

    if (override) {
      // look for existing property
      const property = override.properties.find(prop => prop.id === propId);
      if (property) {
        property.value = width;
      } else {
        override.properties.push({ id: propId, value: width });
      }
    } else {
      overrides.push({
        matcher: { id: matcherId, options: fieldDisplayName },
        properties: [{ id: propId, value: width }],
      });
    }

    this.props.onFieldConfigChange({
      ...fieldConfig,
      overrides,
    });
  };

  onSortByChange = (sortBy: TableSortByFieldState[]) => {
    this.props.onOptionsChange({
      ...this.props.options,
      sortBy,
    });
  };

  onChangeTableSelection = (val: SelectableValue<number>) => {
    this.props.onOptionsChange({
      ...this.props.options,
      frameIndex: val.value || 0,
    });

    // Force a redraw -- but no need to re-query
    this.forceUpdate();
  };

  

  renderTable(frame: DataFrame, width: number, height: number) {
    const { options } = this.props;
    
    const onRowClickFunc = new Function("data,history,setVariable,setTime", getTemplateSrv().replace(options.rowClickEvent))
    return (
      <Table
        height={height}
        width={width}
        data={frame}
        noHeader={!options.showHeader}
        resizable={true}
        initialSortBy={options.sortBy}
        onSortByChange={this.onSortByChange}
        onColumnResize={this.onColumnResize}
        onRowClick={options.enableRowClick ? (data) => onRowClickFunc(data, getHistory(), (k,v) => interactive.setVariable(k,v,this.props.dashboard,this.props.resetDashboardVariables),interactive.setTime) : null}
      />
    );
  }

  getCurrentFrameIndex() {
    const { data, options } = this.props;
    const count = data.series?.length;
    return options.frameIndex > 0 && options.frameIndex < count ? options.frameIndex : 0;
  }

  render() {
    const { data, height, width } = this.props;

    const count = data.series?.length;

    if (!count || count < 1) {
      return <div>No data</div>;
    }

    if (count > 1) {
      const inputHeight = getTheme().spacing.formInputHeight;
      const padding = 8 * 2;
      const currentIndex = this.getCurrentFrameIndex();
      const names = data.series.map((frame, index) => {
        return {
          label: getFrameDisplayName(frame),
          value: index,
        };
      });

      return (
        <div className={tableStyles.wrapper}>
          {this.renderTable(data.series[currentIndex], width, height - inputHeight - padding)}
          <div className={tableStyles.selectWrapper}>
            <Select options={names} value={names[currentIndex]} onChange={this.onChangeTableSelection} />
          </div>
        </div>
      );
    }

    return this.renderTable(data.series[0], width, height - 12);
  }
}

const mapDispatchToProps = {
  resetDashboardVariables,
};

export const TablePanel = connect(null, mapDispatchToProps)(TablePanelUnconnected)

const tableStyles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  `,
  selectWrapper: css`
    padding: 8px;
  `,
};
