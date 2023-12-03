// Copyright 2023 xObserve.io Team

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
      editable: true,
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
