import { Panel, PanelEditorProps } from 'types/dashboard'
import { LayoutOrientation } from 'types/layout'
import { ValueSetting } from 'types/panel/plugins'
import { ThresholdsConfig } from 'types/threshold'

export const PanelTypeStat = 'stat'

export interface StatPanel extends Panel {
  plugins: {
    [PanelTypeStat]: StatSettings
  }
}

export interface StatEditorProps extends PanelEditorProps {
  panel: StatPanel
}

export interface StatSettings {
  showTooltip: boolean
  showGraph: boolean
  displaySeries: string
  showLegend: boolean
  styles: {
    colorMode: 'none' | 'value' | 'bg-gradient' | 'bg-solid'
    layout: LayoutOrientation
    style: 'lines' | 'bars'
    fillOpacity: number
    graphHeight: number
    connectNulls: boolean
    showPoints: boolean
    hideGraphHeight: number
    textAlign: 'left' | 'center'
  }
  textSize: {
    value: number
    legend: number
  }
  axisY: {
    scale: 'linear' | 'log'
    scaleBase: 2 | 10
  }
  value: ValueSetting
}
