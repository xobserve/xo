

import { SeriesData } from 'types/seriesData';
import { DimensionSupplier, ResourceDimensionConfig, ResourceDimensionMode } from './types';
import { findField, getLastNotNullFieldValue } from './utils';



export function getResourceDimension(
  frame: SeriesData | undefined,
  config: ResourceDimensionConfig
): DimensionSupplier<string> {
  const mode = config.mode ?? ResourceDimensionMode.Fixed;
  if (mode === ResourceDimensionMode.Fixed) {
    const v = '/public' + (config.fixed);
    return {
      isAssumed: !Boolean(v),
      fixed: v,
      value: () => v,
      get: (i) => v,
    };
  }

  const field = findField(frame, config.field);
  if (!field) {
    const v = '';
    return {
      isAssumed: true,
      fixed: v,
      value: () => v,
      get: (i) => v,
    };
  }

  if (mode === ResourceDimensionMode.Mapping) {
    const mapper = (v: string) => '/public' +  (`${v}`);
    return {
      field,
      //@ts-ignore
      get: (i) => mapper(field.values.get(i)),
      value: () => mapper(getLastNotNullFieldValue(field)),
    };
  }

  // mode === ResourceDimensionMode.Field case
  const getIcon = (value: string): string => {
    // if (field && field.display) {
    //   const icon = field.display(value).icon;
    //   return '/public' +  (icon ?? '');
    // }

    return '';
  };

  return {
    field,
    //@ts-ignore
    get: (index: number): string => getIcon(field.values.get(index)),
    value: () => getIcon(getLastNotNullFieldValue(field)),
  };
}
