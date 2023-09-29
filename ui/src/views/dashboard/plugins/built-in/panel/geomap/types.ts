import { Panel, PanelEditorProps } from "types/dashboard"
import { ValueSetting } from "types/panel/plugins"
import { ArcGisMapServer, BaseLayerType, DataLayerType } from "types/plugins/geoMap"
import { ThresholdsConfig } from "types/threshold"

export const PanelTypeGeomap = "geomap"

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
        center: [number, number],
        zoom: number
    },
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
    enableClick: boolean
    onClickEvent: string
    thresholds: ThresholdsConfig
}
