import { PanelPluginComponents } from 'types/plugin'
import PanelEditor from './Editor'
import StatPanel from './Stat'
import StatOverridesEditor, {
  StatRules,
  getStatOverrideTargets,
} from './OverridesEditor'
import { mockStatDataForTestDataDs } from './mockData'
import icon from './icon.svg'
import {
  initThresholds,
  onClickCommonEvent,
  getInitUnits,
} from 'src/data/panel/initPlugins'
import { LayoutOrientation } from 'types/layout'
import { ValueCalculationType } from 'types/value'
import { PanelTypeStat } from './types'
import { VarialbeAllOption } from 'src/data/variable'

const panelComponents: PanelPluginComponents = {
  panel: StatPanel,
  editor: PanelEditor,
  overrideEditor: StatOverridesEditor,
  overrideRules: StatRules,
  getOverrideTargets: getStatOverrideTargets,
  mockDataForTestDataDs: mockStatDataForTestDataDs,
  settings: {
    type: PanelTypeStat,
    icon,
    initOptions: () => ({
      showTooltip: true,
      showGraph: true,
      displaySeries: VarialbeAllOption,
      showLegend: false,
      value: {
        ...getInitUnits(),
        decimal: 3,
        calc: ValueCalculationType.Last,
      },
      styles: {
        colorMode: 'value',
        layout: LayoutOrientation.Auto,
        style: 'lines',
        fillOpacity: 80,
        graphHeight: 60,
        connectNulls: false,
        hideGraphHeight: 70,
        textAlign: 'center',
        showPoints: false,
      },
      textSize: {
        value: null,
        legend: null,
      },
      axisY: {
        scale: 'linear',
        scaleBase: 2,
      },
    }),
  },
}

export default panelComponents
