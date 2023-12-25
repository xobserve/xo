import { Panel, PanelEditorProps } from 'types/dashboard'
import { ValueSetting } from 'types/panel/plugins'
import { ThresholdsConfig } from 'types/threshold'

export const PanelTypeEcharts = 'echarts'

export interface EchartsPanel extends Panel {
  plugins: {
    [PanelTypeEcharts]: EchartsSettings
  }
}

export interface EchartsEditorProps extends PanelEditorProps {
  panel: EchartsPanel
}

export interface EchartsSettings {
  animation: boolean
  allowEmptyData: boolean
  setOptionsFunc: string
  thresholds: ThresholdsConfig
  enableThresholds: boolean
  value: ValueSetting
}
