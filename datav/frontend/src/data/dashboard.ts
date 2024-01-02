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

import { Dashboard, DashboardLayout } from 'types/dashboard'
import { PanelBorderType } from 'types/panel/styles'
import { Role } from 'types/role'

export const HomeDashboardId = 'd-home'
export const AlertDashbordId = 'd-alert'

export const initDashboard = (): Dashboard => {
  return {
    id: '',
    title: 'New dashboard',
    tags: [],
    visibleTo: 'team',
    data: {
      panels: [],
      variables: [],
      sharedTooltip: false,
      hidingVars: '',
      description: '',
      styles: {
        bg: {
          url: '',
          colorMode: 'dark',
        },
        bgEnabled: false,
        border: PanelBorderType.None,
        bgColor: '',
        // decoration: {
        //     type: PanelDecorationType.None,
        //     width: '100%',
        //     height: "20px",
        //     top: '-30px',
        //     left: '',
        //     justifyContent: "center",
        //     reverse: false
        // },
      },
      layout: DashboardLayout.Vertical,
      allowPanelsOverlap: false,
      enableUnsavePrompt: true,
      enableAutoSave: false,
      autoSaveInterval: 120,
      lazyLoading: false,
      hiddenPanels: [],
      annotation: {
        enable: true,
        color: 'rgba(0, 211, 255, 1)',
        tagsFilter: '',
        enableRole: Role.ADMIN,
      },
    },
    weight: 0,
  }
}
