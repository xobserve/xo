import { DashboardModel} from "src/views/dashboard/model";
import {PanelState,DashboardInitPhase} from 'src/types'
import { createAction } from "@reduxjs/toolkit";
import { PanelPlugin } from "src/packages/datav-core/src";
import { EDIT_PANEL_ID } from "src/core/constants";


export interface DashboardState {
    inDashboardPage: boolean
    dashboard: DashboardModel
    panels: { [id: string]: PanelState }
    isInitSlow: boolean
    initPhase: DashboardInitPhase
    initErrorStatus: number
}

export const initialState: DashboardState = {
    inDashboardPage: false,
    initPhase: DashboardInitPhase.NotStarted,
    isInitSlow: false,
    dashboard: null,
    panels: {},
    initErrorStatus: null
  };
  

export const dashboardInitCompleted = createAction<DashboardModel>('dashboard/initCompleted');
export const dashboardInitError= createAction<number>('dashboard/initError');
export const updatePanel = createAction<{ panelId: number,plugin: PanelPlugin;}>('dashboard/updatePanel');
export const cleanUpEditPanel =  createAction('dashboard/cleanUpEditPanel');
export const isInDashboardPage = createAction<boolean>('dashboard/isInDashboardPage')
export const cleanUpDashboard = createAction('dashboard/cleanUpDashboard')
export const dashboardReducer = (state = initialState, action: any) => {
    if (dashboardInitCompleted.match(action)) {
        let ps = {};
        for (const panel of action.payload.panels) {
            ps[panel.id] = {
              pluginId: panel.type,
            };
          }
          
      return {
          ...state,
          dashboard: action.payload,
          panels: ps,
          isInitSlow: false,
          initPhase : DashboardInitPhase.Completed
      }
    } 

    if (updatePanel.match(action)) {
        return {
            ...state,
            panels: {
                ...state.panels,
                [action.payload.panelId]: {plugin:action.payload.plugin}
            }
        }
    }

    if (cleanUpEditPanel.match(action)) {
        return {
            ...state,
            panels: delete state.panels[EDIT_PANEL_ID]
        }
    }   

    if (isInDashboardPage.match(action)) {
        return {
            ...state,
            inDashboardPage: action.payload
        }
    }

    if (cleanUpDashboard.match(action)) {
        state.dashboard?.destroy()
        return {
            ...state,
            dashboard:null,
            panels :{},
            initPhase : DashboardInitPhase.NotStarted,
            isInitSlow : false,
            initErrorStatus: null
        }
    }

    if (dashboardInitError.match(action)) {
        return {
            ...state,
            initErrorStatus: action.payload
        }
    }
    return state;
  };

export default {
    dashboard: dashboardReducer,
};