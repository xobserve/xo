// Copyright 2023 xobserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ThresholdArrow } from 'src/views/dashboard/plugins/built-in/panel/bar/types'
import { ThresholdDisplay } from './panel/plugins'
import { PanelStyles } from './panel/styles'
import { Role } from './role'
import { ThresholdsConfig } from './threshold'
import { TimeRange } from './time'
import { Variable } from './variable'

export interface Dashboard {
  id: string
  title: string
  ownedBy?: number
  visibleTo: 'team' | 'all'
  ownerName?: string
  data: DashboardData
  weight: number
  tags?: string[]
  editable?: boolean
  createdBy?: string
  created?: string
  updated?: string
  templateId?: number
  updateChanges?: string
  links?: ExternalLink[]
}

export interface DashboardData {
  description: string
  panels: Panel[]
  variables: Variable[]
  sharedTooltip: boolean
  hidingVars: string
  styles: {
    bg: Record<string, string>
    bgEnabled: boolean
    border: string
    bgColor: string
    // decoration: DecorationStyles
  }
  layout: DashboardLayout
  allowPanelsOverlap: boolean
  enableUnsavePrompt: boolean
  enableAutoSave: boolean
  autoSaveInterval: number
  lazyLoading: boolean
  hiddenPanels: number[]
  annotation: {
    enable: boolean
    enableRole: Role
    color: string
    tagsFilter: string
  }
}

export interface Panel {
  id?: number
  dashId?: string
  title?: string
  gridPos: GridPos
  enableConditionRender?: boolean
  conditionRender?: {
    type: 'variable' | 'custom'
    value: ''
  }
  enableScopeTime?: boolean
  scopeTime?: TimeRange
  templateId?: number

  desc: string
  collapsed: boolean
  datasource?: PanelDatasource
  valueMapping?: ValueMappingItem[]
  transform?: string
  enableTransform?: boolean

  panels?: Panel[]
  interactions?: any
  overrides?: OverrideItem[]
  thresholds?: {
    enable: boolean
    thresholds: ThresholdsConfig
    thresholdsDisplay: ThresholdDisplay
    thresholdArrow: ThresholdArrow
  }

  isSubPanel?: boolean
  disableMenu?: boolean
  allowTypes?: string[]

  externalLinks?: ExternalLink[]

  /*---- template content ----*/
  type: string
  plugins?: Record<string, any>
  styles?: PanelStyles
  /*---------------------------*/
}

export interface ExternalLink {
  url: string
  title: string
  targetBlank: boolean
  icon?: string
}

export interface ValueMappingItem {
  type: 'value' | 'range' | 'null' | 'regex'
  value: any
  text: string
  color: string
}

export interface OverrideItem {
  target: string
  overrides: OverrideRule[]
}

export interface OverrideRule {
  type: string
  value: any
}

export interface PanelEditorProps {
  panel: Panel
  onChange: any
  data?: any
}

export const PanelTypeRow = 'row'

export interface PanelDatasource {
  id?: number
  type?: string
  queryOptions: {
    maxDataPoints?: number
    minInterval: string
  }
  queries?: PanelQuery[]
}

export interface PanelQuery {
  id: number
  metrics: string
  legend?: string
  visible?: boolean
  interval?: number
  data?: { [key: string]: any }
}

export interface GridPos {
  x: number
  y: number
  w: number
  h: number
  static?: boolean
}

export interface PanelProps {
  panel: Panel
  dashboardId?: string
  teamId?: number
  width?: number
  height?: number
  sync?: any
  data?: any
  timeRange?: TimeRange
}

export type PanelData = any

export enum DashboardLayout {
  Vertical = 'vertical',
  Custom = 'null',
  Horizontal = 'horizontal',
}
