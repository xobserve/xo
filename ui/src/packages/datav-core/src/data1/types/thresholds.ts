export interface Threshold {
  colorMode?: 'critical' | 'warning' | 'ok' | 'custom'
  fill?: boolean
  line?: boolean
  op?: 'gt' | 'lt'
  value: number;
  color?: string;
  yaxis?: 'left' | 'right'
}

/**
 *  Display mode
 */
export enum ThresholdsMode {
  Absolute = 'absolute',
  /**
   *  between 0 and 1 (based on min/max)
   */
  Percentage = 'percentage',
}

/**
 *  Config that is passed to the ThresholdsEditor
 */
export interface ThresholdsConfig {
  mode: ThresholdsMode;

  /**
   *  Must be sorted by 'value', first value is always -Infinity
   */
  steps: Threshold[];
}
