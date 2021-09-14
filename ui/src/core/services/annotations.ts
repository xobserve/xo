// Libaries
import _ from 'lodash'

// Utils & Services
// Types
import {DashboardModel} from 'src/views/dashboard/model/DashboardModel'
import { PanelModel } from 'src/views/dashboard/model/PanelModel';

import { AnnotationEvent, AppEvents, DataSourceApi, PanelEvents, TimeRange ,getBackendSrv, getDataSourceService, ScopedVars, DataQueryRequest, rangeUtil, CoreApp } from 'src/packages/datav-core/src';

import appEvents from '../library/utils/app_events';
import { getTimeSrv } from './time';
import dashboard from 'src/store/reducers/dashboard';
import { AnnotationQueryOptions, AnnotationQueryResponse } from 'src/views/annotations/types';
import { Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { standardAnnotationSupport } from 'src/views/annotations/standardAnnotationSupport';
import { runRequest } from 'src/views/dashboard/model/runRequest';

let counter = 100;
function getNextRequestId() {
  return 'AQ' + counter++;
}

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


export function executeAnnotationQuery(
    options: AnnotationQueryOptions,
    datasource: DataSourceApi,
    savedJsonAnno: any
  ): Observable<AnnotationQueryResponse> {
    const processor = {
      ...standardAnnotationSupport,
      ...datasource.annotations,
    };
  
    const annotation = processor.prepareAnnotation!(savedJsonAnno);
    if (!annotation) {
      return of({});
    }
  
    const query = processor.prepareQuery!(annotation);
    if (!query) {
      return of({});
    }
  
    // No more points than pixels
    const maxDataPoints = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  
    // Add interval to annotation queries
    const interval = rangeUtil.calculateInterval(options.range, maxDataPoints, datasource.interval);
  
    const scopedVars: ScopedVars = {
      __interval: { text: interval.interval, value: interval.interval },
      __interval_ms: { text: interval.intervalMs.toString(), value: interval.intervalMs },
      __annotation: { text: annotation.name, value: annotation },
    };
  
    const queryRequest: DataQueryRequest = {
      startTime: Date.now(),
      requestId: getNextRequestId(),
      range: options.range,
      maxDataPoints,
      scopedVars,
      ...interval,
      app: CoreApp.Dashboard,
  
      timezone: options.dashboard.timezone,
  
      targets: [
        {
          ...query,
          refId: 'Anno',
        },
      ],
    };
  
    return runRequest(datasource, queryRequest).pipe(
      mergeMap((panelData) => {
        if (!panelData.series) {
          return of({ panelData, events: [] });
        }
  
        return processor.processEvents!(annotation, panelData.series).pipe(map((events) => ({ panelData, events })));
      })
    );
  }
  
export const annotationsSrv = new AnnotationsSrv()