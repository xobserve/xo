import _ from 'lodash';
import localStore from '../library/utils/localStore';
import {store} from 'src/store/store'
export class ImpressionSrv {
  constructor() {}

  addDashboardImpression(dashboardId: number) {
    const impressionsKey = this.impressionKey();
    let impressions = [];
    if (localStore.exists(impressionsKey)) {
      impressions = JSON.parse(localStore.get(impressionsKey));
      if (!_.isArray(impressions)) {
        impressions = [];
      }
    }

    impressions = impressions.filter(imp => {
      return dashboardId !== imp;
    });

    impressions.unshift(dashboardId);

    if (impressions.length > 50) {
      impressions.pop();
    }

    localStore.set(impressionsKey, JSON.stringify(impressions));
  }

  getDashboardOpened() {
    let impressions = localStore.get(this.impressionKey()) || '[]';

    impressions = JSON.parse(impressions);

    impressions = _.filter(impressions, el => {
      return _.isNumber(el);
    });

    return impressions;
  }

  impressionKey() {
    return 'dashboard_impressions'
  }
}

const impressionSrv = new ImpressionSrv();
export default impressionSrv;
