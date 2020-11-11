import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  toDataFrame,
  DataFrame,
  FieldType,
  ArrayVector,
} from 'src/packages/datav-core/src';

import { getTemplateSrv } from 'src/packages/datav-core/src';
import { StaticQuery, StaticDataSourceOptions } from './types';

// DataSource returns the data frame returned in the query model.
export class DataSource extends DataSourceApi<StaticQuery, StaticDataSourceOptions> {
  constructor(instanceSettings: DataSourceInstanceSettings<StaticDataSourceOptions>) {
    super(instanceSettings);
  }

  async query(options: DataQueryRequest<StaticQuery>): Promise<DataQueryResponse> {
    // Interpolate variables in string fields.
    const interpolateVariables = (frame: DataFrame) => {
      for (let i = 0; i < frame.fields.length; i++) {
        const field = frame.fields[i];

        // Skip non-text fields.
        if (field.type === FieldType.string) {
          field.values = new ArrayVector(field.values.toArray().map(_ => getTemplateSrv().replace(_, {}, 'csv')));
        }

        frame.fields[i] = field;
      }
      return frame;
    };

    return {
      data: options.targets
        .filter(target => !target.hide)
        .filter(target => target.frame)
        .map(target => toDataFrame(target.frame))
        .map(interpolateVariables),
    };
  }

  async testDatasource() {
    // This data source makes no external requests so no need to test.
    return {
      status: 'success',
      message: 'Success',
    };
  }
}
