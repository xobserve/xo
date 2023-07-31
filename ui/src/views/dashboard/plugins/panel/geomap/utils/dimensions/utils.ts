import {
  ColorDimensionConfig,
  DimensionSupplier,
  ResourceDimensionConfig,
  ScaleDimensionConfig,
  TextDimensionConfig,
  ScalarDimensionConfig,
} from './types';

import { getScalarDimension } from './scalar';
import { getColorDimension } from './color';
import useExtraTheme from 'hooks/useExtraTheme';
import { Field, SeriesData } from 'types/seriesData';
import { Series } from 'uplot';
import { getResourceDimension } from './resource';
import { getScaledDimension } from './scale';
import { getTextDimension } from './text';

export function getColorDimensionFromData(
  data: any,
  cfg: ColorDimensionConfig
): DimensionSupplier<string> {
  if (data?.series && cfg.field) {
    for (const frame of data.series) {
      const d = getColorDimension(frame, cfg, useExtraTheme());
      if (!d.isAssumed || data.series.length === 1) {
        return d;
      }
    }
  }
  return getColorDimension(undefined, cfg, useExtraTheme());
}

export function getScaleDimensionFromData(
  data: any | undefined,
  cfg: ScaleDimensionConfig
): DimensionSupplier<number> {
  if (data?.series && cfg.field) {
    for (const frame of data.series) {
      const d = getScaledDimension(frame, cfg);
      if (!d.isAssumed || data.series.length === 1) {
        return d;
      }
    }
  }
  return getScaledDimension(undefined, cfg);
}

export function getScalarDimensionFromData(
  data: any | undefined,
  cfg: ScalarDimensionConfig
): DimensionSupplier<number> {
  if (data?.series && cfg.field) {
    for (const frame of data.series) {
      const d = getScalarDimension(frame, cfg);
      if (!d.isAssumed || data.series.length === 1) {
        return d;
      }
    }
  }
  return getScalarDimension(undefined, cfg);
}

export function getResourceDimensionFromData(
  data: any | undefined,
  cfg: ResourceDimensionConfig
): DimensionSupplier<string> {
  if (data?.series && cfg.field) {
    for (const frame of data.series) {
      const d = getResourceDimension(frame, cfg);
      if (!d.isAssumed || data.series.length === 1) {
        return d;
      }
    }
  }
  return getResourceDimension(undefined, cfg);
}

export function getTextDimensionFromData(
  data: any | undefined,
  cfg: TextDimensionConfig
): DimensionSupplier<string> {
  if (data?.series && cfg.field) {
    for (const frame of data.series) {
      const d = getTextDimension(frame, cfg);
      if (!d.isAssumed || data.series.length === 1) {
        return d;
      }
    }
  }
  return getTextDimension(undefined, cfg);
}

export function findField(frame?: SeriesData, name?: string): Field | undefined {
  if (!frame || !name?.length) {
    return undefined;
  }

  for (const field of frame.fields) {
    if (name === field.name) {
      return field;
    }
    // const disp = getFieldDisplayName(field, frame);
    // if (name === disp) {
    //   return field;
    // }
  }
  return undefined;
}

export function findFieldIndex(frame?: SeriesData, name?: string): number | undefined {
  if (!frame || !name?.length) {
    return undefined;
  }

  for (let i = 0; i < frame.fields.length; i++) {
    const field = frame.fields[i];
    if (name === field.name) {
      return i;
    }
    // const disp = getFieldDisplayName(field, frame);
    // if (name === disp) {
    //   return i;
    // }
  }
  return undefined;
}

export function getLastNotNullFieldValue<T>(field: Field): T {
  const data = field.values;
  let idx = data.length - 1;
  while (idx >= 0) {
    //@ts-ignore
    const v = data.get(idx--);
    if (v != null) {
      return v;
    }
  }
  return undefined as any;
}
