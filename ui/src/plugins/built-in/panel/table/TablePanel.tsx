import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Table, Select, getTheme, getHistory } from 'src/packages/datav-core';
import { FieldMatcherID, PanelProps, DataFrame, SelectableValue, getFrameDisplayName } from 'src/packages/datav-core';
import { Options } from './types';
import { css } from 'emotion';

import { TableSortByFieldState } from 'src/packages/datav-core';
import { resetDashboardVariables } from 'src/views/dashboard/model/initDashboard'
import { join, indexOf,cloneDeep} from 'lodash';


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

  setVariable = (name, value) => {
    const vars = this.props.dashboard.templating.list
    for (const v of vars) {
      console.log(cloneDeep(v))
      if (v.name === 'test') {
        if (!v.multi) {
          v.current = {
            text: 'b',
            value: 'b',
            selected: false
          }

          for (const o of v.options) {
            if (o.text === 'b') {
              o.selected = true
            } else {
              o.selected = false
            }
          }
        } else {
          const values = cloneDeep(v.current.value)
          if (indexOf(values, 'c') === -1) {
            values.push('c')
            v.current = {
              text: join(values, "+"),
              value: values,
              selected: true,
            }
  
            for (const o of v.options) {
              if (indexOf(values, o.text) !== -1) {
                o.selected = true
              } else {
                o.selected = false
              }
            }
          }
        }
      }
    }
     this.props.resetDashboardVariables(this.props.dashboard)
  }

  renderTable(frame: DataFrame, width: number, height: number) {
    const { options } = this.props;


    //     {option: {…}, clearOthers: false, forceSelect: false}
    // clearOthers: false
    // forceSelect: false
    // option: {selected: false, text: "c", value: "c"}

    const onRowClick = new Function('data,history,setVariable', `
      setVariable()
    `)
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
        onRowClick={(data) => onRowClick(data, getHistory(), this.setVariable)}
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

const mapStateToProps = (state) => {
  return {

  }
}
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
