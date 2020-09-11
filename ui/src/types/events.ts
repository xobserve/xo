import React from 'react'
import { AppEvents, TimeRange } from 'src/packages/datav-core';
import { DashboardModel } from 'src/views/dashboard/model/DashboardModel';
// import appEvents from 'src/core/library/utils/app_events';

const eventFactory = AppEvents.eventFactory
/**
 * Event Payloads
 */

export interface ShowDashSearchPayload {
  query?: string;
}

export interface LocationChangePayload {
  href: string;
}

export interface ShowModalPayload {
  component: any;
  title?: string;
  onConfirm?: () => void;
}

export interface ShowConfirmModalPayload {
  title?: any;
  text?: any;
  text2?: any; 
  text2htmlBind?: boolean;
  confirmText?: any;
  altActionText?: string;
  yesText?: any;
  noText?: string;
  icon?: string;

  onConfirm?: () => void;
  onAltAction?: () => void;
}

export interface DataSourceResponse<T> {
  data: T;
  readonly status: number;
  readonly statusText: string;
  readonly ok: boolean;
  readonly headers: Headers;
  readonly redirected: boolean;
  readonly type: ResponseType;
  readonly url: string;
  readonly config: any;
}

type DataSourceResponsePayload = DataSourceResponse<any>;

export interface SaveDashboardPayload {
  overwrite?: boolean;
  folderId?: number;
  makeEditable?: boolean;
}

export interface GraphHoverPayload {
  pos: any;
  panel: {
    id: number;
  };
}

export interface ToggleKioskModePayload {
  exit?: boolean;
}

export interface GraphClickedPayload {
  pos: any;
  panel: any;
  item: any;
}

export interface ThresholdChangedPayload {
  threshold: any;
  handleIndex: any;
}

export interface DashScrollPayload {
  restore?: boolean;
  animate?: boolean;
  pos?: number;
}

/**
 * Events
 */

export const showDashSearch = eventFactory<ShowDashSearchPayload>('show-dash-search');
export const hideDashSearch = eventFactory('hide-dash-search');
export const hideDashEditor = eventFactory('hide-dash-editor');
export const dashScroll = eventFactory<DashScrollPayload>('dash-scroll');
export const dashLinksUpdated = eventFactory('dash-links-updated');
export const saveDashboard = eventFactory<SaveDashboardPayload>('save-dashboard');
export const dashboardFetchStart = eventFactory('dashboard-fetch-start');
export const dashboardSaved = eventFactory<DashboardModel>('dashboard-saved');
export const removePanel = eventFactory<number>('remove-panel');

export const searchQuery = eventFactory('search-query');

export const locationChange = eventFactory<LocationChangePayload>('location-change');

export const timepickerOpen = eventFactory('timepickerOpen');
export const timepickerClosed = eventFactory('timepickerClosed');

export const showConfirmModal = eventFactory<ShowConfirmModalPayload>('confirm-modal');
export const hideModal = eventFactory('hide-modal');
export const showModal = eventFactory<ShowModalPayload>('show-modal');

export const dsRequestResponse = eventFactory<DataSourceResponsePayload>('ds-request-response');
export const dsRequestError = eventFactory<any>('ds-request-error');

export const graphHover = eventFactory<GraphHoverPayload>('graph-hover');
export const graphHoverClear = eventFactory('graph-hover-clear');

export const toggleSidemenuMobile = eventFactory('toggle-sidemenu-mobile');
export const toggleSidemenuHidden = eventFactory('toggle-sidemenu-hidden');

export const playlistStarted = eventFactory('playlist-started');
export const playlistStopped = eventFactory('playlist-stopped');

export const toggleKioskMode = eventFactory<ToggleKioskModePayload>('toggle-kiosk-mode');
export const toggleViewMode = eventFactory('toggle-view-mode');

export const timeRangeUpdated = eventFactory<TimeRange>('time-range-updated');

export const repeatsProcessed = eventFactory('repeats-processed');
export const rowExpanded = eventFactory('row-expanded');
export const rowCollapsed = eventFactory('row-collapsed');
export const templateVariableValueUpdated = eventFactory('template-variable-value-updated');
export const submenuVisibilityChanged = eventFactory<boolean>('submenu-visibility-changed');

export const graphClicked = eventFactory<GraphClickedPayload>('graph-click');

export const thresholdChanged = eventFactory<ThresholdChangedPayload>('threshold-changed');

export const zoomOut = eventFactory<number>('zoom-out');

export const shiftTime = eventFactory<number>('shift-time');

export const elasticQueryUpdated = eventFactory('elastic-query-updated');

export const layoutModeChanged = eventFactory<string>('layout-mode-changed');

export const jsonDiffReady = eventFactory('json-diff-ready');

export const closeTimepicker = eventFactory('closeTimepicker');

export const routeUpdated = eventFactory('$routeUpdate');

export const keybindingSaveDashboard = eventFactory<any>('keybading-save-dashboard');