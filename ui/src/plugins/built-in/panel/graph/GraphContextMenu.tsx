import React from 'react';
import { GraphDimensions } from './types';
import {
  FlotDataPoint,
  getValueFromDimension,
  getDisplayProcessor,
  formattedValueToString,
  Dimensions,
  dateTimeFormat,
  TimeZone,
  ContextMenu,
  ContextMenuProps
} from 'src/packages/datav-core/src';
import { SeriesIcon } from './Legend/LegendSeriesItem'
import './GraphContextMenu.less'

export type ContextDimensions<T extends Dimensions = any> = { [key in keyof T]: [number, number | undefined] | null };

export type GraphContextMenuProps = ContextMenuProps & {
  getContextMenuSource: () => FlotDataPoint | null;
  timeZone?: TimeZone;
  dimensions?: GraphDimensions;
  contextDimensions?: ContextDimensions;
};

export const GraphContextMenu: React.FC<GraphContextMenuProps> = ({
  getContextMenuSource,
  timeZone,
  items,
  dimensions,
  contextDimensions,
  ...otherProps
}) => {
  const source = getContextMenuSource();

  //  Do not render items that do not have label specified
  const itemsToRender = items
    ? items.map(group => ({
      ...group,
      items: group.items.filter(item => item.label),
    }))
    : [];

  const renderHeader = () => {
    if (!source) {
      return null;
    }

    // If dimensions supplied, we can calculate and display value
    let value;
    if (dimensions?.yAxis && contextDimensions?.yAxis?.[1]) {
      const valueFromDimensions = getValueFromDimension(
        dimensions.yAxis,
        contextDimensions.yAxis[0],
        contextDimensions.yAxis[1]
      );
      const display =
        source.series.valueField.display ??
        getDisplayProcessor({
          field: source.series.valueField,
          timeZone,
        });
      value = display(valueFromDimensions);
    }

    const formattedValue = dateTimeFormat(source.datapoint[0], {
      defaultWithMS: source.series.hasMsResolution,
      timeZone,
    });

    return (
      <div className="datav-graph-context-menu graph-context-menu">
        <div
          className='context-menu-header'
        >
          <strong>{formattedValue}</strong>
          <div>
            <SeriesIcon color={source.series.color} />
            <span
              className="context-menu-label"
            >
              {source.series.alias || source.series.label}
            </span>
            {value && (
              <span
                className='context-menu-value'
              >
                {formattedValueToString(value)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return <ContextMenu {...otherProps} items={itemsToRender} renderHeader={renderHeader} />;
};
