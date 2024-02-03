import { PanelPluginComponents } from 'types/plugin'
import PanelEditor from './Editor'
import BarPanelWrapper from './Bar'
import BarOverridesEditor, {
  BarRules,
  getBarOverrideTargets,
} from './OverridesEditor'
import { mockBarDataForTestDataDs } from './mockData'
import icon from './icon.svg'
import { ValueCalculationType } from 'types/value'
import {
  initThresholds,
  onClickCommonEvent,
  getInitUnits,
} from 'src/data/panel/initPlugins'
import { ThresholdDisplay } from 'types/panel/plugins'
import { PanelTypeBar, ThresholdArrow } from './types'

const panelComponents: PanelPluginComponents = {
  panel: BarPanelWrapper,
  editor: PanelEditor,
  overrideEditor: BarOverridesEditor,
  overrideRules: BarRules,
  getOverrideTargets: getBarOverrideTargets,
  mockDataForTestDataDs: mockBarDataForTestDataDs,
  settings: {
    type: PanelTypeBar,
    icon,
    initOptions: () => {
      return {
        animation: true,
        showGrid: true,
        tooltip: 'all',
        showLabel: 'auto',
        stack: 'auto',
        axis: {
          swap: false,
          scale: 'linear',
          scaleBase: 2,
        },
        styles: {
          barWidth: 85,
          axisFontSize: 11,
          labelFontSize: 11,
          barOpacity: 80,
        },
        value: {
          ...getInitUnits(),
          decimal: 2,
        },
        legend: {
          show: true,
          placement: 'bottom',
          valueCalcs: [ValueCalculationType.Last],
          width: 500,
          nameWidth: '400',
          order: {
            by: ValueCalculationType.Last,
            sort: 'desc',
          },
        },
      }
    },
  },
}

export default panelComponents
