import React from 'react';
import uPlot, { Options, AlignedData } from 'uplot';
import { TimeRange } from 'types/time'

import { UPlotConfigBuilder } from './config/builder';
import { Field } from 'types/dataFrame';
import { Threshold } from 'types/threshold';

export type PlotConfig = Pick<
    Options,
    'mode' | 'series' | 'scales' | 'axes' | 'cursor' | 'bands' | 'hooks' | 'select' | 'tzDate' | 'padding'
>;

export interface PlotPluginProps {
    id: string;
}

export type FacetValues = any[];
export type FacetSeries = FacetValues[];
export type FacetedData = [_: null, ...series: FacetSeries];

export interface PlotProps {
    data: AlignedData | FacetedData;
    width: number;
    height: number;
    config: UPlotConfigBuilder;
    timeRange: TimeRange;
    children?: React.ReactNode;
    // Reference to uPlot instance
    plotRef?: (u: uPlot) => void;
}

export abstract class PlotConfigBuilder<P, T> {
    constructor(public props: P) { }
    abstract getConfig(): T;
}

/**
 * @alpha
 */
export type PlotTooltipInterpolator = (
    updateActiveSeriesIdx: (sIdx: number | null) => void,
    updateActiveDatapointIdx: (dIdx: number | null) => void,
    updateTooltipPosition: (clear?: boolean) => void,
    u: uPlot
) => void;

export interface PlotSelection {
    min: number;
    max: number;

    // selection bounding box, relative to canvas
    bbox: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
}


export enum AxisPlacement {
    Auto = 'auto',
    Bottom = 'bottom',
    Hidden = 'hidden',
    Left = 'left',
    Right = 'right',
    Top = 'top',
}


export enum StackingMode {
    None = 'none',
    Normal = 'normal',
    Percent = 'percent',
}

export enum BarAlignment {
    After = 1,
    Before = -1,
    Center = 0,
}


export enum GraphDrawStyle {
    Bars = 'bars',
    Line = 'line',
    Points = 'points',
}

export enum LineInterpolation {
    Linear = 'linear',
    Smooth = 'smooth',
    StepAfter = 'stepAfter',
    StepBefore = 'stepBefore',
}

export enum GraphTransform {
    Constant = 'constant',
    NegativeY = 'negative-Y',
}



export enum ScaleDistribution {
    Linear = 'linear',
    Log = 'log',
    Ordinal = 'ordinal',
    Symlog = 'symlog',
}

export interface ScaleDistributionConfig {
    linearThreshold?: number;
    log?: number;
    type: ScaleDistribution;
}

export enum ScaleOrientation {
    Horizontal = 0,
    Vertical = 1,
}

export enum ScaleDirection {
    Down = -1,
    Left = -1,
    Right = 1,
    Up = 1,
}

export enum VisibilityMode {
    Always = 'always',
    Auto = 'auto',
    Never = 'never',
}


export interface BarConfig {
    barAlignment?: BarAlignment;
    barMaxWidth?: number;
    barWidthFactor?: number;
}


export interface FillConfig {
    fillBelowTo?: string;
    fillColor?: string;
    fillOpacity?: number;
}

export interface PointsConfig {
    pointColor?: string;
    pointSize?: number;
    pointSymbol?: string;
    showPoints?: VisibilityMode;
}


export enum GraphGradientMode {
    Hue = 'hue',
    None = 'none',
    Opacity = 'opacity',
    Scheme = 'scheme',
}


export interface LineConfig {
    lineColor?: string;
    lineInterpolation?: LineInterpolation;
    lineStyle?: LineStyle;
    lineWidth?: number;
    /**
     * Indicate if null values should be treated as gaps or connected.
     * When the value is a number, it represents the maximum delta in the
     * X axis that should be considered connected.  For timeseries, this is milliseconds
     */
    spanNulls?: (boolean | number);
    hideFrom?: any
}

export interface LineStyle {
    dash?: Array<number>;
    fill?: ('solid' | 'dash' | 'dot' | 'square');
}


export interface GraphThresholdsStyleConfig {
    mode: GraphTresholdsStyleMode;
}


export enum GraphTresholdsStyleMode {
    Area = 'area',
    Dashed = 'dashed',
    DashedAndArea = 'dashed+area',
    Line = 'line',
    LineAndArea = 'line+area',
    Off = 'off',
    Series = 'series',
}


/**
 * @public
 */
export enum FieldColorModeId {
    Thresholds = 'thresholds',
    PaletteClassic = 'palette-classic',
    PaletteSaturated = 'palette-saturated',
    ContinuousGrYlRd = 'continuous-GrYlRd',
    Fixed = 'fixed',
  }
  
  /**
   * @public
   */
  export interface FieldColor {
    /** The main color scheme mode */
    mode: FieldColorModeId | string;
    /** Stores the fixed color value if mode is fixed */
    fixedColor?: string;
    /** Some visualizations need to know how to assign a series color from by value color schemes */
    seriesBy?: FieldColorSeriesByMode;
  }
  
  /**
   * @beta
   */
  export type FieldColorSeriesByMode = 'min' | 'max' | 'last';
  
  export const FALLBACK_COLOR = 'gray';
  

  export interface RegistryItem {
    id: string; // Unique Key -- saved in configs
    name: string; // Display Name, can change without breaking configs
    description?: string;
    aliasIds?: string[]; // when the ID changes, we may want backwards compatibility ('current' => 'last')
  
    /**
     * Some extensions should not be user selectable
     *  like: 'all' and 'any' matchers;
     */
    excludeFromPicker?: boolean;
  
    /**
     * Optional feature state
     */
    state?: PluginState;
  }

  export enum PluginState {
    alpha = 'alpha', // Only included if `enable_alpha` config option is true
    beta = 'beta', // Will show a warning banner
    stable = 'stable', // Will not show anything
    deprecated = 'deprecated', // Will continue to work -- but not show up in the options to add
  }

  export type FieldValueColorCalculator = (value: number, percent: number, Threshold?: Threshold) => string;

  export interface FieldColorMode extends RegistryItem {
    getCalculator: (field: Field, theme) => FieldValueColorCalculator;
    getColors?: (theme) => string[];
    isContinuous?: boolean;
    isByValue?: boolean;
  }


  export interface GraphFieldConfig extends LineConfig, FillConfig, PointsConfig, AxisConfig, BarConfig, StackableFieldConfig, HideableFieldConfig {
    drawStyle?: GraphDrawStyle;
    gradientMode?: GraphGradientMode;
    thresholdsStyle?: GraphThresholdsStyleConfig;
    transform?: GraphTransform;
  }


  export interface AxisConfig {
    axisCenteredZero?: boolean;
    axisColorMode?: AxisColorMode;
    axisGridShow?: boolean;
    axisLabel?: string;
    axisPlacement?: AxisPlacement;
    axisSoftMax?: number;
    axisSoftMin?: number;
    axisWidth?: number;
    scaleDistribution?: ScaleDistributionConfig;
  }

  export enum AxisColorMode {
    Series = 'series',
    Text = 'text',
  }


  export interface StackableFieldConfig {
    stacking?: StackingConfig;
  }


  export interface StackingConfig {
    group?: string;
    mode?: StackingMode;
  }

  export enum DashboardCursorSync {
    Off,
    Crosshair,
    Tooltip,
  }
  