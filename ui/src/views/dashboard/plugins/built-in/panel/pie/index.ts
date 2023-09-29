
import { PanelPluginComponents } from "types/plugin";
import PanelEditor from "./Editor";
import PiePanelWrapper from "./Pie";
import PieOverridesEditor, { PieRules, getPieOverrideTargets } from "./OverridesEditor";
import { mockPieDataForTestDataDs } from "./mockData";
import icon from './pie.svg'
import { initThresholds, onClickCommonEvent, getInitUnits } from "src/data/panel/initPlugins";
import { ValueCalculationType } from "types/value";
import { PanelTypePie, PieLegendPlacement } from "./types";


const panelComponents: PanelPluginComponents = {
    panel: PiePanelWrapper,
    editor: PanelEditor,
    overrideEditor: PieOverridesEditor,
    overrideRules: PieRules,
    getOverrideTargets: getPieOverrideTargets,
    mockDataForTestDataDs: mockPieDataForTestDataDs,
    settings: {
        type: PanelTypePie,
        icon,
        initOptions: {
            animation: true,
            shape: {
                type: 'normal',
                borderRadius: 8,
                radius: 80,
                innerRadius: 0,
            },
            label: {
                show: true,
                align: "none",
                margin: 5,
                showValue: false,
                showName: true,
                fontSize: 12,
                lineHeight: 16,
                transformName:
                    `function transformName(rawName, params) {
    return rawName
}`
            },
            legend: {
                show: false,
                orient: 'horizontal',
                placement: PieLegendPlacement.Bottom,
                width: 25,
                height: 14,
                gap: 10,
                fontSize: 12
            },
            top: "50%",
            left: "50%",
            value: {
                ...getInitUnits(),
                decimal: 3,
                calc: ValueCalculationType.Last
            },
            thresholds: initThresholds(12),
            enableThresholds: false,
            showThreshodBorder: true,
            enableClick: true,
            onClickEvent: onClickCommonEvent
        },
    }
}

export default panelComponents