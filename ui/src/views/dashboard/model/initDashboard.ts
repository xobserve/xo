import { DashboardModel } from "./DashboardModel";
import { dashboardMock } from './mocks'
import { DashboardDTO,ThunkResult } from "src/types";
import { getBackendSrv, config } from "src/packages/datav-core/src";
import {store} from 'src/store/store'
import { initDashboardTemplating, processVariables, completeDashboardTemplating } from "src/views/variables/state/actions";
import { dashboardInitCompleted, dashboardInitError } from "src/store/reducers/dashboard";
import { annotationsSrv } from 'src/core/services/annotations';
import { message } from "antd";

export function initDashboard(uid: string | undefined,initOrigin: any): ThunkResult<void>  {
  return async (dispatch, getState) => {
  // try {
    let ds;
    if (!uid) {
      // return new dashboard
      ds = new DashboardModel(getNewDashboardModelData().dashboard, getNewDashboardModelData().meta)
    } else {
      try {
        const res = await getBackendSrv().get(`/api/dashboard/uid/${uid}`)
        ds = new DashboardModel(res.data.dashboard,res.data.meta)
      } catch (error) {
        dispatch(dashboardInitError(error.status))
        return 
      }
    }


    // template values service needs to initialize completely before
    // the rest of the dashboard can load
    try {
      if (config.featureToggles.newVariables) {
        dispatch(initDashboardTemplating(ds.templating.list));
        await dispatch(processVariables());
        dispatch(completeDashboardTemplating(ds));
      }
    } catch (err) {
      message.error('Templating init failed')
      console.log(err);
    }

    annotationsSrv.init(ds);
    initOrigin(ds)
    dispatch(dashboardInitCompleted(ds))
  }
}


function getNewDashboardModelData(): DashboardDTO {
  const data = {
    meta: {
      canStar: true,
      canShare: true,
      canSave: true,
      isNew: true,
      folderId: 0,
    },
    dashboard: {
      title: 'New dashboard',
      panels: [
        {
          id: 1,
          type: 'add-panel',
          gridPos: { x: 0, y: 0, w: 12, h: 9 },
          title: 'Panel Title',
          options: {
            lines: true
          }
        },
      ],
      templating: {
      }
    },
  };

  return data;
}