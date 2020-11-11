import React, { PureComponent } from 'react';
import {
  DisplayValueAlignmentFactors,
  FieldDisplay,
  getDisplayValueAlignmentFactors,
  getFieldDisplayValues,
  PanelProps,
  DataLinksContextMenuApi,
  currentTheme,
  getTheme
} from 'src/packages/datav-core/src';
import { BarGauge, DataLinksContextMenu, VizRepeater, VizRepeaterRenderValueProps } from 'src/packages/datav-core/src';

import { BarGaugeOptions } from './types';

export class BarGaugePanel extends PureComponent<PanelProps<BarGaugeOptions>> {
  renderComponent = (
    valueProps: VizRepeaterRenderValueProps<FieldDisplay, DisplayValueAlignmentFactors>,
    menuProps: DataLinksContextMenuApi
  ): JSX.Element => {
    const { options } = this.props;
    const { value, alignmentFactors, orientation, width, height } = valueProps;
    const { field, display, view, colIndex } = value;
    const { openMenu, targetClassName } = menuProps;

    return (
      <BarGauge
        value={display}
        width={width}
        height={height}
        orientation={orientation}
        field={field}
        display={view?.getFieldDisplayProcessor(colIndex)}
        theme={getTheme(currentTheme)}
        itemSpacing={this.getItemSpacing()}
        displayMode={options.displayMode}
        onClick={openMenu}
        className={targetClassName}
        alignmentFactors={alignmentFactors}
        showUnfilled={options.showUnfilled}
      />
    );
  };

  renderValue = (valueProps: VizRepeaterRenderValueProps<FieldDisplay, DisplayValueAlignmentFactors>): JSX.Element => {
    const { value } = valueProps;
    const { hasLinks, getLinks } = value;

    if (!hasLinks) {
      return this.renderComponent(valueProps, {});
    }

    return (
      <DataLinksContextMenu links={getLinks}>
        {api => {
          return this.renderComponent(valueProps, api);
        }}
      </DataLinksContextMenu>
    );
  };

  getValues = (): FieldDisplay[] => {
    const { data, options, replaceVariables, fieldConfig, timeZone } = this.props;
    return getFieldDisplayValues({
      fieldConfig,
      reduceOptions: options.reduceOptions,
      replaceVariables,
      data: data.series,
      autoMinMax: true,
      timeZone,
    });
  };

  getItemSpacing(): number {
    if (this.props.options.displayMode === 'lcd') {
      return 2;
    }

    return 10;
  }

  render() {
    const { height, width, options, data, renderCounter } = this.props;
    return (
      <VizRepeater
        source={data}
        getAlignmentFactors={getDisplayValueAlignmentFactors}
        getValues={this.getValues}
        renderValue={this.renderValue}
        renderCounter={renderCounter}
        width={width}
        height={height}
        itemSpacing={this.getItemSpacing()}
        orientation={options.orientation}
      />
    );
  }
}
