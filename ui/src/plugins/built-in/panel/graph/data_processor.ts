import _ from 'lodash';
import {
  TimeRange,
  FieldType,
  Field,
  DataFrame,
  getTimeField,
  dateTime,
  getFieldDisplayName,
  currentTheme,
  getColorForTheme,
  getBootConfig
} from 'src/packages/datav-core/src';
import {colors} from 'src/packages/datav-core/src/ui'
import TimeSeries from 'src/core/time_series';
import { GraphOptions} from './GraphPanelCtrl'
import { getTheme, getTheme2 } from 'src/packages/datav-core/src/ui/themes/getTheme';

type Options = {
  dataList: DataFrame[];
  range?: TimeRange;
};

export class DataProcessor {
  options: GraphOptions;
  constructor(options:GraphOptions) {
    this.options = options
  }

  getSeriesList(options: Options): TimeSeries[] {
    const list: TimeSeries[] = [];
    const { dataList, range } = options;

    if (!dataList || !dataList.length) {
      return list;
    }

    for (let i = 0; i < dataList.length; i++) {
      const series = dataList[i];
      const { timeField } = getTimeField(series);

      if (!timeField) {
        continue;
      }

      for (let j = 0; j < series.fields.length; j++) {
        const field = series.fields[j];

        if (field.type !== FieldType.number) {
          continue;
        }
        const name = getFieldDisplayName(field, series, dataList);
        const datapoints = [];

        for (let r = 0; r < series.length; r++) {
          datapoints.push([field.values.get(r), dateTime(timeField.values.get(r)).valueOf()]);
        }

        list.push(this.toTimeSeries(field, name, i, j, datapoints, list.length, range));
      }
    }

    // Merge all the rows if we want to show a histogram
    if (this.options.xaxis.mode === 'histogram' && !this.options.stack && list.length > 1) {
      const first = list[0];
      first.alias = first.aliasEscaped = 'Count';

      for (let i = 1; i < list.length; i++) {
        first.datapoints = first.datapoints.concat(list[i].datapoints);
      }

      return [first];
    }

    return list;
  }

  private toTimeSeries(
    field: Field,
    alias: string,
    dataFrameIndex: number,
    fieldIndex: number,
    datapoints: any[][],
    index: number,
    range?: TimeRange
  ) {
    const colorIndex = index % colors.length;
    const color = this.options.aliasColors[alias] || colors[colorIndex];

    const config = getBootConfig()
    const series = new TimeSeries({
      datapoints: datapoints || [],
      alias: alias,
      color: getColorForTheme(color, config.theme),
      unit: field.config ? field.config.unit : undefined,
      dataFrameIndex,
      fieldIndex,
    });

    if (datapoints && datapoints.length > 0 && range) {
      const last = datapoints[datapoints.length - 1][1];
      const from = range.from;

      if (last - from.valueOf() < -10000) {
        series.isOutsideRange = true;
      }
    }
    return series;
  }

  setPanelDefaultsForNewXAxisMode() {
    switch (this.options.xaxis.mode) {
      case 'time': {
        this.options.bars = false;
        this.options.lines = true;
        this.options.points = false;
        this.options.legend.show = true;
        this.options.tooltip.shared = true;
        this.options.xaxis.values = [];
        break;
      }
      case 'series': {
        this.options.bars = true;
        this.options.lines = false;
        this.options.points = false;
        this.options.stack = false;
        this.options.legend.show = false;
        this.options.tooltip.shared = false;
        this.options.xaxis.values = ['total'];
        break;
      }
      case 'histogram': {
        this.options.bars = true;
        this.options.lines = false;
        this.options.points = false;
        this.options.stack = false;
        this.options.legend.show = false;
        this.options.tooltip.shared = false;
        break;
      }
    }
  }

  validateXAxisSeriesValue() {
    switch (this.options.xaxis.mode) {
      case 'series': {
        if (this.options.xaxis.values.length === 0) {
          this.options.xaxis.values = ['total'];
          return;
        }

        const validOptions = this.getXAxisValueOptions({});
        const found: any = _.find(validOptions, { value: this.options.xaxis.values[0] });
        if (!found) {
          this.options.xaxis.values = ['total'];
        }
        return;
      }
    }
  }

  getXAxisValueOptions(options: any) {
    switch (this.options.xaxis.mode) {
      case 'series': {
        return [
          { text: 'Avg', value: 'avg' },
          { text: 'Min', value: 'min' },
          { text: 'Max', value: 'max' },
          { text: 'Total', value: 'total' },
          { text: 'Count', value: 'count' },
        ];
      }
    }

    return [];
  }

  pluckDeep(obj: any, property: string) {
    const propertyParts = property.split('.');
    let value = obj;
    for (let i = 0; i < propertyParts.length; ++i) {
      if (value[propertyParts[i]]) {
        value = value[propertyParts[i]];
      } else {
        return undefined;
      }
    }
    return value;
  }
}
