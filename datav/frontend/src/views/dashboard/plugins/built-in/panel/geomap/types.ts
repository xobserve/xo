import { Panel, PanelEditorProps } from 'types/dashboard'
import { ValueSetting } from 'types/panel/plugins'
import { ThresholdsConfig } from 'types/threshold'

export const PanelTypeGeomap = 'geomap'

export interface GeomapPanel extends Panel {
  plugins: {
    [PanelTypeGeomap]: GeoMapSettings
  }
}

export interface GeomapEditorProps extends PanelEditorProps {
  panel: GeomapPanel
}

export interface GeoMapSettings {
  sizeScale: {
    enable: boolean
    baseSize: number
    maxScale: number
  }
  initialView: {
    center: [number, number]
    zoom: number
  }
  baseMap: {
    layer: BaseLayerType
    mapServer: ArcGisMapServer
    url: string
    attr: string
  }
  dataLayer: {
    layer: DataLayerType
    opacity: number
  }
  controls: {
    enableZoom: boolean
    showZoom: boolean
    showAttribution: boolean
    showScale: boolean
    showDebug: boolean
    showMeasure: boolean
    showTooltip: boolean
  }
  value: ValueSetting
  thresholds: ThresholdsConfig
}

export enum BaseLayerType {
  OpenStreet = 'Open Street Map',
  ArcGis = 'ArcGIS Map Server',
  Custom = 'Custom',
}

export enum ArcGisMapServer {
  WorldStreet = 'World_Street_Map',
  WorldImagery = 'World_Imagery',
  WorldPhysical = 'World_Physical_Map',
  Topographic = 'Topographic',
  UsaTopo = 'USA_Topographic',
  Ocean = 'World_Ocean',
  // Custom = "Custom MapServer"
}

export enum DataLayerType {
  Heatmap = 'Heatmap',
  Markers = 'Markers',
}

export interface GeoMapDataLayer {
  type: DataLayerType
}
