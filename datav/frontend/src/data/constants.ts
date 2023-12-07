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

export const GRID_CELL_HEIGHT = 10
export const GRID_CELL_VMARGIN = 8
export const GRID_COLUMN_COUNT = 24

export const PANEL_HEADER_HEIGHT = 25
export const PANEL_BODY_PADDING = 5
export const DashboardHeaderHeight = 70
export enum ColorMode {
  Light = 'light',
  Dark = 'dark',
}

export const DatasourceMaxDataPoints = 600
export const DatasourceMinInterval = '15s'

export const DefaultDecimal = 3

export const MobileBreakpoint = '(min-width: 900px)'
export const IsSmallScreen = '(max-width: 900px)'
export const MobileVerticalBreakpointNum = 600
export const MobileVerticalBreakpoint = `(max-width: ${MobileVerticalBreakpointNum}px)`
