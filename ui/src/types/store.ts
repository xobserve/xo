
import { ThunkAction, ThunkDispatch as GenericThunkDispatch } from 'redux-thunk';
import { PayloadAction } from '@reduxjs/toolkit';
import {UserState} from 'src/store/reducers/user'
import {ApplicationState} from 'src/store/reducers/application'
import {LogState} from './log'
import {TemplatingState} from 'src/views/variables/state/reducers'
import {PluginsState} from 'src/store/reducers/plugins'
import {PanelEditorState} from 'src/store/reducers/panelEditor'
import { DashboardState } from 'src/store/reducers/dashboard'
import { LocationState } from 'src/store/reducers/location'
import { MenuState } from 'src/store/reducers/menu';

export interface StoreState {
    user: UserState
    application: ApplicationState
    templating: TemplatingState
    log: LogState
    plugins: PluginsState
    panelEditor: PanelEditorState
    dashboard: DashboardState
    location: LocationState
    menu: MenuState
}

/*
 * Utility type to get strongly types thunks
 */
export type ThunkResult<R> = ThunkAction<R, StoreState, undefined, PayloadAction<any>>;

export type ThunkDispatch = GenericThunkDispatch<StoreState, undefined, any>;