import { DashboardModel } from '../model';
import { DashboardMeta } from 'src/types';

import { RemovePanelEvent } from '../../../types/events';
import appEvents from 'src/core/library/utils/app_events';
import { getBackendSrv } from 'src/core/services/backend/backend';
import { removePanel } from '../model/panel';

export class DashboardSrv {
  dashboard?: DashboardModel;

  constructor() {
    appEvents.subscribe(RemovePanelEvent, (e) => this.onRemovePanel(e.payload));
  }

  create(dashboard: any, meta: DashboardMeta) {
    return new DashboardModel(dashboard, meta);
  }

  setCurrent(dashboard: DashboardModel) {
    this.dashboard = dashboard;
  }

  getCurrent(): DashboardModel | undefined {
    if (!this.dashboard) {
      console.warn('Calling getDashboardSrv().getCurrent() without calling getDashboardSrv().setCurrent() first.');
    }
    return this.dashboard;
  }

  onRemovePanel = (panelId: number) => {
    const dashboard = this.getCurrent();
    if (dashboard) {
      removePanel(dashboard, dashboard.getPanelById(panelId)!, true);
    }
  };


  starDashboard(dashboardId: string, isStarred: any) {
    const backendSrv = getBackendSrv();
    let promise;

    if (isStarred) {
      promise = backendSrv.delete('/api/user/stars/dashboard/' + dashboardId).then(() => {
        return false;
      });
    } else {
      promise = backendSrv.post('/api/user/stars/dashboard/' + dashboardId).then(() => {
        return true;
      });
    }

    return promise.then((res: boolean) => {
      if (this.dashboard && this.dashboard.id === dashboardId) {
        this.dashboard.meta.isStarred = res;
      }
      return res;
    });
  }
}

//
// Code below is to export the service to React components
//

let singletonInstance: DashboardSrv;

export const dashboardSrv = new DashboardSrv();

export function setDashboardSrv(instance: DashboardSrv) {
  singletonInstance = instance;
}

export function getDashboardSrv(): DashboardSrv {
  return singletonInstance;
}
