import { PanelPluginComponents } from 'types/plugin'
import PanelEditor from './Editor'
import Panel from './Gauge'
import { mockGaugeDataForTestDataDs } from './mockData'
import icon from './icon.svg'
import { ValueCalculationType } from 'types/value'
import { initThresholds, getInitUnits } from 'src/data/panel/initPlugins'
import { PanelTypeGauge } from './types'

const panelComponents: PanelPluginComponents = {
  panel: Panel,
  editor: PanelEditor,
  mockDataForTestDataDs: mockGaugeDataForTestDataDs,
  settings: {
    type: PanelTypeGauge,
    icon,
    initOptions: () => ({
      animation: true,
      diisplaySeries: null,
      valueStyle: {
        show: true,
        min: 0,
        max: 100,
        fontSize: 15,
        left: '0%',
        top: '75%',
      },
      value: {
        ...getInitUnits(),
        decimal: 1,
        calc: ValueCalculationType.Last,
      },
      scale: {
        enable: true,
        splitNumber: 2,
        fontSize: 14,
      },
      axis: {
        width: 25,
        showTicks: true,
      },
      title: {
        show: false,
        display: null,
        fontSize: 14,
        left: '0%',
        top: '60%',
      },
      pointer: {
        length: '80%',
        width: 8,
      },
    }),
  },
}

export default panelComponents
