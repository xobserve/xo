import { Panel, PanelEditorProps } from 'types/dashboard'
import { ValueSetting } from 'types/panel/plugins'
import { ThresholdsConfig } from 'types/threshold'

export const PanelTypePie = 'pie'

export interface PiePanel extends Panel {
  plugins: {
    [PanelTypePie]: PieSettings
  }
}

export interface PieEditorProps extends PanelEditorProps {
  panel: PiePanel
}

export interface PieSettings {
  animation: boolean
  label: {
    show: boolean
    showValue: boolean
    showName: boolean
    align: 'none' | 'labelLine' | 'edge'
    margin: number
    fontSize: number
    transformName: string
    lineHeight: number
  }
  shape: {
    type: 'normal' | 'rose'
    borderRadius: number
    radius: number
    innerRadius: number
  }
  legend: {
    show: boolean
    orient: 'vertical' | 'horizontal'
    placement: PieLegendPlacement
    fontSize: number
    width: number
    height: number
    gap: number
  }
  top: string
  left: string
  value: ValueSetting
  showSplitBorder: boolean
}

export enum PieLegendPlacement {
  Top = 'top',
  Bottom = 'bottom',
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
}

export type PiePluginData = PiePartData[]

export interface PiePartData {
  name: string
  value: number
}
