
import { PanelPluginComponents } from "types/plugin";
import PanelEditor from "./Editor";
import GeoMapPanelWrapper from "./GeoMap";
import GeomapOverridesEditor, { GeomapRules, getGeomapOverrideTargets } from "./OverridesEditor";
import { mockGeomapDataForTestDataDs } from "./mocks/mockData";
import icon from './icon.svg'
import { initThresholds, getInitUnits } from "src/data/panel/initPlugins";
import { ValueCalculationType } from "types/value";
import { PanelTypeGeomap,  ArcGisMapServer, BaseLayerType, DataLayerType } from "./types";

const panelComponents: PanelPluginComponents = {
    panel: GeoMapPanelWrapper,
    editor: PanelEditor,
    overrideEditor: GeomapOverridesEditor,
    overrideRules: GeomapRules,
    getOverrideTargets: getGeomapOverrideTargets,
    mockDataForTestDataDs:  mockGeomapDataForTestDataDs,
    settings: {
        type: PanelTypeGeomap,
        icon,
        initOptions: {
            initialView: {
                center: [0, 0],
                zoom: 2,
            },
            baseMap: {
                layer: BaseLayerType.ArcGis,
                mapServer: ArcGisMapServer.WorldStreet,
                url: null,
                attr: null
            },
            dataLayer: {
                layer: DataLayerType.Markers,
                opacity: 0.6
            },
            controls: {
                enableZoom: true,
                showZoom: true,
                showAttribution: true,
                showScale: true,
                showDebug: false,
                showMeasure: false,
                showTooltip: true
            },
            value: {
                ...getInitUnits(),
                decimal: 1,
                calc: ValueCalculationType.Last
            },
            sizeScale: {
                enable: true,
                baseSize: 10,
                maxScale: 4
            },
            enableClick: true,
            onClickEvent: `
// map:  openlayer map <https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html>
// setVariable: (varName:string, varValue:string) => void 
// navigate: react-router-dom -> useNavigate() -> navigate 
// setDateTime: (from: Timestamp, to: TimeStamp) => void

function onClick(data, map, navigate, setVariable, setDateTime, $variables) {
    // You can get all current variables in this way
    const coords = data[0].getGeometry().flatCoordinates
    const view = map.getView()
    view.setCenter(coords)
    view.setZoom(10)
}
`,
            thresholds: initThresholds(12)
        },
    }
}

export default  panelComponents