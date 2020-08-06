import {PanelPlugin,PluginMeta} from 'src/packages/datav-core'
import { createAction } from '@reduxjs/toolkit';
import {PluginDashboard,PanelPluginsIndex} from 'src/types'

export interface PluginsState {
  plugins: PluginMeta[];
  searchQuery: string;
  hasFetched: boolean;
  dashboards: PluginDashboard[];
  isLoadingPluginDashboards: boolean;
  panels: PanelPluginsIndex;
}

export const initialState: PluginsState = {
    plugins: [],
    searchQuery: '',
    hasFetched: false,
    dashboards: [],
    isLoadingPluginDashboards: false,
    panels: {},
  };

export const setPanelPlugin = createAction<PanelPlugin>('plugins/setPanel')

export const pluginsReducer = (state = initialState, action: any) => {
    if (setPanelPlugin.match(action)) {
        return {
          ...state,
          panels: {
            ...state.panels,
            [action.payload.meta!.id] : action.payload
          }
        }
    } 
    
    return state;
  }

  export default {
    plugins: pluginsReducer,
  };