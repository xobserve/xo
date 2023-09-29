
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import GeoMapPanelWrapper from "./GeoMap";
import GeomapOverridesEditor, { GeomapRules, getGeomapOverrideTargets } from "./OverridesEditor";
import { mockGeomapDataForTestDataDs } from "./mocks/mockData";
import icon from './geomap.svg'

const panelComponents: PanelPluginComponents = {
    panel: GeoMapPanelWrapper,
    editor: PanelEditor,
    overrideEditor: GeomapOverridesEditor,
    overrideRules: GeomapRules,
    getOverrideTargets: getGeomapOverrideTargets,
    mockDataForTestDataDs:  mockGeomapDataForTestDataDs,
    icon
}

export default  panelComponents