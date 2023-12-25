import { Panel, PanelEditorProps } from 'types/dashboard'
import { LayoutOrientation } from 'types/layout'
import { AlertFilter, DisableDatasource } from 'types/panel/plugins'

export const PanelTypeAlert = 'alert'

export interface AlertPanel extends Panel {
  plugins: {
    [PanelTypeAlert]: AlerSettings
  }
}

export interface AlertEditorProps extends PanelEditorProps {
  panel: AlertPanel
}

export interface AlerSettings extends DisableDatasource {
  viewMode: 'list' | 'stat'
  stat: {
    showGraph: boolean
    color: string
    layout: LayoutOrientation
    colorMode: 'none' | 'value' | 'bg-gradient' | 'bg-solid'
    style: 'lines' | 'bars'
    statName: string
    valueSize: number
    legendSize: number
  }
  orderBy: 'newest' | 'oldest'
  toolbar: {
    show: boolean
    width: number
  }
  chart: {
    show: boolean
    height: string
    showLabel: 'auto' | 'always' | 'none'
    stack: 'auto' | 'always' | 'none'
    tooltip: 'none' | 'single' | 'all'
  }
  filter: AlertFilter
}

import { AlertState } from 'types/alert'

// limitations under the License.
export interface AlertToolbarOptions {
  maxBars?: number
  barType?: 'labels' | 'total'
  viewMode?: 'list' | 'stat'
  persist?: boolean
  stateFilter?: AlertState[]
  ruleNameFilter?: string
  ruleLabelsFilter?: string
  labelNameFilter?: string
}

export interface AlertGroup {
  name: string
  file: string
  rules: AlertRule[]
  evaluationTime: number
  lastEvaluation: string
  interval: number
  limit: number
}

export interface AlertRule {
  name: string
  state: AlertState
  type: 'alerting' | 'recording'
  query: string
  duration: number
  keepFiringFor: number
  labels: Record<string, string>
  annotations: Record<string, string>
  alerts: Alert[]
  health: 'ok' | 'error'
  lastEvaluation: string
  evaluationTime: number
  activeAt: string

  groupName: string
  groupNamespace: string
  fromDs: string
}

export interface Alert {
  name: string
  labels: Record<string, string>
  annotations: Record<string, string>
  state: AlertState
  activeAt: string
  value: number
}
