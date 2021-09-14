import { cloneDeep } from 'lodash';
import { Observable, of } from 'rxjs';
import { createErrorNotification } from 'src/core/app_notification';
import { AnnotationEvent, AnnotationQuery, DataFrame, DataFrameView, getBootConfig } from 'src/packages/datav-core/src/data';
import { toDataQueryError } from 'src/packages/datav-core/src/runtime';
import { notifyApp } from 'src/store/reducers/appNotification';
import { dispatch } from 'src/store/store';


import { DashboardQueryRunnerWorkerResult } from './types';

export function handleAnnotationQueryRunnerError(err: any): Observable<AnnotationEvent[]> {
  if (err.cancelled) {
    return of([]);
  }

  notifyWithError('AnnotationQueryRunner failed', err);
  return of([]);
}

export const emptyResult: () => Observable<DashboardQueryRunnerWorkerResult> = () =>
  of({ annotations: [], alertStates: [] });

export function handleDashboardQueryRunnerWorkerError(err: any): Observable<DashboardQueryRunnerWorkerResult> {
  if (err.cancelled) {
    return emptyResult();
  }

  notifyWithError('DashboardQueryRunner failed', err);
  return emptyResult();
}

function notifyWithError(title: string, err: any) {
  const error = toDataQueryError(err);
  console.error('handleAnnotationQueryRunnerError', error);
  const notification = createErrorNotification(title, error.message);
  dispatch(notifyApp(notification));
}

export function getAnnotationsByPanelId(annotations: AnnotationEvent[], panelId?: number) {
  return annotations.filter((item) => {
    if (panelId !== undefined && item.panelId && item.source?.type === 'dashboard') {
      return item.panelId === panelId;
    }
    return true;
  });
}

export function translateQueryResult(annotation: AnnotationQuery, results: AnnotationEvent[]): AnnotationEvent[] {
  // if annotation has snapshotData
  // make clone and remove it
  if (annotation.snapshotData) {
    annotation = cloneDeep(annotation);
    delete annotation.snapshotData;
  }

  for (const item of results) {
    item.source = annotation;
    item.color = getBootConfig().theme2.visualization.getColorByName(annotation.iconColor);
    item.type = annotation.name;
    item.isRegion = Boolean(item.timeEnd && item.time !== item.timeEnd);

    switch (item.newState) {
      case 'pending':
        item.color = 'gray';
        break;
      case 'alerting':
        item.color = 'red';
        break;
      case 'ok':
        item.color = 'green';
        break;
      case 'no_data':
        item.color = 'gray';
        break;
    }
  }

  return results;
}

export function annotationsFromDataFrames(data?: DataFrame[]): AnnotationEvent[] {
  if (!data || !data.length) {
    return [];
  }

  const annotations: AnnotationEvent[] = [];
  for (const frame of data) {
    const view = new DataFrameView<AnnotationEvent>(frame);
    for (let index = 0; index < frame.length; index++) {
      const annotation = cloneDeep(view.get(index));
      annotations.push(annotation);
    }
  }

  return annotations;
}
