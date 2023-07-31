import { Map as OpenLayersMap } from 'ol';
import { FeatureLike } from 'ol/Feature';
import { Units } from 'ol/control/ScaleLine';
import BaseLayer from 'ol/layer/Base';
import { Subject } from 'rxjs';

import { StyleConfig } from './style/types';
import { ComparisonOperation } from 'types/misc';
import { ReactNode } from 'react';
import { RegistryItem } from './utils/registry';

export interface LayerElement {
    getName: () => string;
}


export interface ControlsOptions extends ControlsOptionsBase {
    scaleUnits?: Units;
}

export interface FeatureStyleConfig {
    style?: StyleConfig;
    check?: FeatureRuleConfig;
}

export interface FeatureRuleConfig {
    property: string;
    operation: ComparisonOperation;
    value: string | boolean | number;
}

export interface GeomapLayerActions {
    selectLayer: (uid: string) => void;
    deleteLayer: (uid: string) => void;
    addlayer: (type: string) => void;
    reorder: (src: number, dst: number) => void;
    canRename: (v: string) => boolean;
}

export interface GeomapInstanceState {
    map?: OpenLayersMap;
    layers: MapLayerState[];
    selected: number;
    actions: GeomapLayerActions;
}

export interface MapLayerHandler<TConfig = any> {
    init: () => BaseLayer;
    /**
     * The update function should only be implemented if the layer type makes use of query data
     */
    update?: (data: any) => void;

    /** Optional callback for cleanup before getting removed */
    dispose?: () => void;

    /** return react node for the legend */
    legend?: ReactNode;

    /**
     * Show custom elements in the panel edit UI
     */
    registerOptionsUI?: (builder: any) => void;
}

export interface MapLayerState<TConfig = unknown> extends LayerElement {
    options: MapLayerOptions<TConfig>;
    handler: any;
    layer: BaseLayer; // the openlayers instance
    onChange: (cfg: MapLayerOptions<TConfig>) => void;
    isBasemap?: boolean;
    mouseEvents: Subject<FeatureLike | undefined>;
}

export enum FrameGeometrySourceMode {
    Auto = 'auto',
    Coords = 'coords',
    Geohash = 'geohash',
    Lookup = 'lookup',
}

export interface FrameGeometrySource {
    /**
     * Path to Gazetteer
     */
    gazetteer?: string;
    /**
     * Field mappings
     */
    geohash?: string;
    latitude?: string;
    longitude?: string;
    lookup?: string;
    mode: FrameGeometrySourceMode;
    wkt?: string;
}

export interface RawMatcherConfig {
    id: string;
    options?: unknown;
}

export interface MatcherConfig<TConfig = any> extends RawMatcherConfig {
    options?: TConfig;
}

export interface MapLayerOptions<TConfig = any> extends RawMapLayerOptions {
    // Custom options depending on the type
    config?: TConfig;
    filterData?: MatcherConfig;
}

export interface RawMapLayerOptions {
    /**
     * Custom options depending on the type
     */
    config?: unknown;
    /**
     * Defines a frame MatcherConfig that may filter data for the given layer
     */
    filterData?: unknown;
    /**
     * Common method to define geometry fields
     */
    location?: FrameGeometrySource;
    /**
     * configured unique display name
     */
    name: string;
    /**
     * Common properties:
     * https://openlayers.org/en/latest/apidoc/module-ol_layer_Base-BaseLayer.html
     * Layer opacity (0-1)
     */
    opacity?: number;
    /**
     * Check tooltip (defaults to true)
     */
    tooltip?: boolean;
    type: string;
}


export const PanelCfgModelVersion = Object.freeze([0, 0]);

export interface PanelOptions {
    basemap: MapLayerOptions;
    controls: ControlsOptions;
    layers: Array<MapLayerOptions>;
    tooltip: TooltipOptions;
    view: MapViewConfig;
}

export const defaultPanelOptions: Partial<PanelOptions> = {
    layers: [],
};

export interface MapViewConfig {
    allLayers?: boolean;
    id: string;
    lastOnly?: boolean;
    lat?: number;
    layer?: string;
    lon?: number;
    maxZoom?: number;
    minZoom?: number;
    padding?: number;
    shared?: boolean;
    zoom?: number;
}

export const defaultMapViewConfig: Partial<MapViewConfig> = {
    allLayers: true,
    id: 'zero',
    lat: 0,
    lon: 0,
    zoom: 1,
};

export interface ControlsOptionsBase {
    /**
     * let the mouse wheel zoom
     */
    mouseWheelZoom?: boolean;
    /**
     * Lower right
     */
    showAttribution?: boolean;
    /**
     * Show debug
     */
    showDebug?: boolean;
    /**
     * Show measure
     */
    showMeasure?: boolean;
    /**
     * Scale options
     */
    showScale?: boolean;
    /**
     * Zoom (upper left)
     */
    showZoom?: boolean;
}

export interface TooltipOptions {
    mode: TooltipMode;
}

export enum TooltipMode {
    Details = 'details',
    None = 'none',
}

export enum MapCenterID {
    Coords = 'coords',
    Fit = 'fit',
    Zero = 'zero',
}

export interface RegistryItemWithOptions<TOptions = any> extends RegistryItem {
    /**
     * Convert the options to a string
     */
    getOptionsDisplayText?: (options: TOptions) => string;
  
    /**
     * Default options used if nothing else is specified
     */
    defaultOptions?: TOptions;
  }


export interface MapLayerRegistryItem<TConfig = MapLayerOptions> extends RegistryItemWithOptions {
    /**
     * This layer can be used as a background
     */
    isBaseMap?: boolean;

    /**
     * Show location controls
     */
    showLocation?: boolean;

    /**
     * Hide transparency controls in UI
     */
    hideOpacity?: boolean;

    /**
     * Function that configures transformation and returns a transformer
     * @param options
     */
    create: (
        map: OpenLayersMap,
        options: MapLayerOptions<TConfig>,
        theme: any
    ) => Promise<MapLayerHandler>;
}

export interface SelectableValue<T = any> {
    label?: string;
    ariaLabel?: string;
    value?: T;
    imgUrl?: string;
    icon?: string;
    // Secondary text under the the title of the option.
    description?: string;
    // Adds a simple native title attribute to each option.
    title?: string;
    // Optional component that will be shown together with other options. Does not get past any props.
    component?: React.ComponentType<any>;
    [key: string]: any;
  }