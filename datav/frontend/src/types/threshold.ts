// Copyright 2023 xObserve.io Team

export interface Threshold {
  value: number
  color: string
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
  Custom = 'Custom',
}

/**
 *  Config that is passed to the ThresholdsEditor
 */
export interface ThresholdsConfig {
  mode: ThresholdsMode

  /**
   *  Must be sorted by 'value'
   */
  thresholds: Threshold[]
  enableTransform: boolean
  transform: string
}
