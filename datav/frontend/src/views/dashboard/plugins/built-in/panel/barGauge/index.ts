import { PanelPluginComponents } from 'types/plugin'
import PanelEditor from './Editor'
import BarGaugePanel from './BarGauge'
import BarGaugeOverridesEditor, {
  BarGaugeRules,
  getBarguageOverrideTargets,
} from './OverrideEditor'
import { mockBarGaugeDataForTestDataDs } from './mockData'
import icon from './icon.svg'
import {
  initThresholds,
  onClickCommonEvent,
  getInitUnits,
} from 'src/data/panel/initPlugins'
import { ValueCalculationType } from 'types/value'
import { PanelTypeBarGauge } from './types'

const panelComponents: PanelPluginComponents = {
  panel: BarGaugePanel,
  editor: PanelEditor,
  overrideEditor: BarGaugeOverridesEditor,
  overrideRules: BarGaugeRules,
  getOverrideTargets: getBarguageOverrideTargets,
  mockDataForTestDataDs: mockBarGaugeDataForTestDataDs,
  settings: {
    type: PanelTypeBarGauge,
    icon,
    initOptions: {
      value: {
        ...getInitUnits(),
        decimal: 2,
        calc: ValueCalculationType.Last,
      },
      orientation: 'vertical',
      mode: 'basic',
      style: {
        showUnfilled: true,
        titleSize: 16,
        valueSize: 14,
      },
      min: null,
      max: null,
      maxminFrom: 'all',
      showMax: true,
      showMin: true,
      thresholds: initThresholds(6),
    },
  },
}

export default panelComponents
