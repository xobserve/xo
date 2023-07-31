
  
  import { Field, SeriesData } from 'types/seriesData';
import { ColorDimensionConfig, DimensionSupplier } from './types';
  import { findField, getLastNotNullFieldValue } from './utils';
  
  //---------------------------------------------------------
  // Color dimension
  //---------------------------------------------------------
  
  export function getColorDimension(
    frame: SeriesData | undefined,
    config: ColorDimensionConfig,
    theme: any
  ): DimensionSupplier<string> {
    return getColorDimensionForField(findField(frame, config.field), config, theme);
  }
  
  export function getColorDimensionForField(
    field: Field | undefined,
    config: ColorDimensionConfig,
    theme: any
  ): DimensionSupplier<string> {
    if (!field) {
      const v = theme.visualization.getColorByName(config.fixed ?? 'grey');
      return {
        isAssumed: Boolean(config.field?.length) || !config.fixed,
        fixed: v,
        value: () => v,
        get: (i) => v,
      };
    }
  
      const getColor = (value: unknown): string => {
        return '#ccc';
      };
  
      return {
        field,
        //@ts-ignore
        get: (index: number): string => getColor(field!.values.get(index)),
        value: () => getColor(getLastNotNullFieldValue(field!)),
      };
}
  