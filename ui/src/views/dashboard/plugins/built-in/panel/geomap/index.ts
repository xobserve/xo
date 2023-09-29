
import { PanelPluginComponents } from "types/plugins/plugin";
import PanelEditor from "./Editor";
import GeoMapPanelWrapper from "./GeoMap";
import GeomapOverridesEditor, { GeomapRules, getGeomapOverrideTargets } from "./OverridesEditor";
import { mockGeomapDataForTestDataDs } from "./mocks/mockData";


const panelComponents: PanelPluginComponents = {
    panel: GeoMapPanelWrapper,
    editor: PanelEditor,
    overrideEditor: GeomapOverridesEditor,
    overrideRules: GeomapRules,
    getOverrideTargets: getGeomapOverrideTargets,
    mockDataForTestDataDs:  mockGeomapDataForTestDataDs
}

export default  panelComponents