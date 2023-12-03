
import { PanelPluginComponents } from "types/plugin";
import PanelEditor from "./Editor";
import GraphOverridesEditor, { GraphRules, getGraphOverrideTargets } from "./OverridesEditor";
import GraphPanelWrapper from "./Graph";
import { mockGraphDataForTestDataDs } from "./mockData";
import icon from './icon.svg'
import { ValueCalculationType } from "types/value";
import { ThresholdDisplay } from "types/panel/plugins";
import { initAlertFilter, initThresholds, getInitUnits } from "src/data/panel/initPlugins";
import { PanelTypeGraph } from "./types";

const panelComponents: PanelPluginComponents = {
    panel: GraphPanelWrapper,
    editor: PanelEditor,
    overrideEditor: GraphOverridesEditor,
    overrideRules: GraphRules,
    getOverrideTargets: getGraphOverrideTargets,
    mockDataForTestDataDs:  mockGraphDataForTestDataDs,
    settings: {
        type: PanelTypeGraph,
        icon,
        initOptions: {
            tooltip: {
                mode: 'all',
                sort: 'desc'
            },
            legend: {
                mode: "table",
                placement: "bottom",
                valueCalcs: [ValueCalculationType.Last],
                showValuesName: true,
                width: 500,
                nameWidth: '400',
                order: {
                    by: ValueCalculationType.Last,
                    sort: 'desc'
                }
            },
            styles: {
                style: "lines",
                lineWidth: 1,
                fillOpacity: 80,
                showPoints: "auto",
                pointSize: 6,
                gradientMode: "opacity",
                connectNulls: false,
                barRadius: 0,
                barGap: 10,
                enableStack: false,
                padding: [null, null, null, null]
            },
            axis: {
                showGrid: true,
                showX: true,
                showY: true,
                scale: "linear",
                scaleBase: 2
            },
            value: {
                ...getInitUnits(),
                decimal: 3
            },
            thresholds: initThresholds(),
            thresholdsDisplay: ThresholdDisplay.None,
            enableAlert: false,
            alertFilter: initAlertFilter(),
            clickActions: []
        }
    }
}

export default  panelComponents


