// Libaries
import _ from 'lodash'
import flattenDeep from 'lodash/flattenDeep';
import cloneDeep from 'lodash/cloneDeep';

// Utils & Services
// Types
import {DashboardModel} from 'src/views/dashboard/model/DashboardModel'
import { PanelModel } from 'src/views/dashboard/model/PanelModel';

import { AnnotationEvent, AppEvents, DataSourceApi, PanelEvents, TimeRange ,getBackendSrv, getDataSourceService } from 'src/packages/datav-core/src';

import appEvents from '../library/utils/app_events';
import { getTimeSrv } from './time';
import dashboard from 'src/store/reducers/dashboard';


export class AnnotationsSrv {
    globalAnnotationsPromise: any;
    alertStatesPromise: any;
    datasourcePromises: any;
    annotations:any;
    dashboard: DashboardModel;
    init(dashboard: DashboardModel) {
        // always clearPromiseCaches when loading new dashboard
        this.clearCaches();
        // clear promises on refresh events
        // dashboard.on(PanelEvents.refresh, this.clearCaches.bind(this));
        this.dashboard = dashboard
        if (dashboard.id) {
            this.getAnnotations()
        }   
    }

    clearCaches() {
        this.annotations = null
        this.globalAnnotationsPromise = null;
        this.alertStatesPromise = null;
        this.datasourcePromises = null;
        this.dashboard = null
    }

    async getAnnotations() {
        if (this.dashboard.id) {
            const range = getTimeSrv().timeRange()
            const res = await getBackendSrv().get('/api/annotations',{dashboardId: this.dashboard.id,from: range.from.valueOf(),to: range.to.valueOf()})
            const results = res.data
            for (const item of results) {
                item.isRegion = item.timeEnd !== 0 && item.time !== item.timeEnd
                item.source = {"builtIn":1,"datasource":"-- Grafana --","enable":true,"hide":true,"iconColor":"rgba(0, 211, 255, 1)","name":"Annotations & Alerts","type":"dashboard"}
            }
        
            this.annotations = results
        }
    }

    getAlertStates(options: any) {
        if (!options.dashboard.id) {
            return Promise.resolve([]);
        }

        // ignore if no alerts
        if (options.panel && !options.panel.alert) {
            return Promise.resolve([]);
        }

        if (options.range.raw.to !== 'now') {
            return Promise.resolve([]);
        }

        if (this.alertStatesPromise) {
            return this.alertStatesPromise;
        }

        this.alertStatesPromise = getBackendSrv().get(
            '/api/alerts/states-for-dashboard',
            {
                dashboardId: options.dashboard.id,
            },
            `get-alert-states-${options.dashboard.id}`
        );

        return this.alertStatesPromise;
    }


    saveAnnotationEvent(annotation: AnnotationEvent) {
        return getBackendSrv().post('/api/annotations', annotation);
    }

    updateAnnotationEvent(annotation: AnnotationEvent) {
        return getBackendSrv().put(`/api/annotations/${annotation.id}`, annotation);
    }

    deleteAnnotationEvent(annotation: AnnotationEvent) {
        const deleteUrl = `/api/annotations/${annotation.id}`;

        return getBackendSrv().delete(deleteUrl);
    }



    isPanelAlert(event: { eventType: string }) {
        return event.eventType === 'panel-alert';
    }

}

export const annotationsSrv = new AnnotationsSrv()