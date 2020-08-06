import validationSrv from 'src/core/services/validation';
import { getBackendSrv } from 'src/packages/datav-core';

export const validateDashboardJson = (json: string) => {
  try {
    JSON.parse(json);
    return true;
  } catch (error) {
    return 'Not valid JSON';
  }
};

export const validateGcomDashboard = (gcomDashboard: string) => {
  // From DashboardImportCtrl
  const match = /(^\d+$)|dashboards\/(\d+)/.exec(gcomDashboard);

  return match && (match[1] || match[2]) ? true : 'Could not find a valid Grafana.com id';
};

export const validateTitle = (newTitle: string, folderId: number) => {
  return getBackendSrv()
  .get(`/api/search/dashboard`,{type:1,query:newTitle})
  .then(res => {
    const existingDashboard = res.data
    if (existingDashboard.id === 0) {
        return true
    }

    return `Dashboard named '${existingDashboard?.title}' already exist`;
  })
  .catch(error => {
    error.isHandled = true;
    return true;
  });
};

export const validateUid = (value: string) => {
  return getBackendSrv()
    .get(`/api/dashboard/uid/${value}`)
    .then(res => {
      const existingDashboard = res.data
      return `Dashboard named '${existingDashboard?.dashboard.title}' in folder '${existingDashboard?.meta.folderTitle}' has the same uid`;
    })
    .catch(error => {
      error.isHandled = true;
      return true;
    });
};
