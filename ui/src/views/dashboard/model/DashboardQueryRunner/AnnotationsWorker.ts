import { cloneDeep } from 'lodash';
import { from, merge, Observable, of } from 'rxjs';
import { filter, finalize, map, mergeAll, mergeMap, reduce, takeUntil } from 'rxjs/operators';
import { getDataSourceService } from 'src/packages/datav-core/src/runtime';
import { AnnotationQuery, DataSourceApi } from 'src/packages/datav-core/src/data';

import {
  AnnotationQueryRunner,
  DashboardQueryRunnerOptions,
  DashboardQueryRunnerWorker,
  DashboardQueryRunnerWorkerResult,
} from './types';
import { emptyResult, translateQueryResult } from './utils';
import { LegacyAnnotationQueryRunner } from './LegacyAnnotationQueryRunner';
import { AnnotationsQueryRunner } from './AnnotationsQueryRunner';
import { AnnotationQueryFinished, AnnotationQueryStarted } from 'src/types';
import { getDashboardQueryRunner } from './DashboardQueryRunner';

export class AnnotationsWorker implements DashboardQueryRunnerWorker {
  constructor(
    private readonly runners: AnnotationQueryRunner[] = [
      new LegacyAnnotationQueryRunner(),
      new AnnotationsQueryRunner(),
    ]
  ) {}

  canWork({ dashboard }: DashboardQueryRunnerOptions): boolean {
    const annotations = dashboard.annotations.list.find(AnnotationsWorker.getAnnotationsToProcessFilter);
    return Boolean(annotations);
  }

  work(options: DashboardQueryRunnerOptions): Observable<DashboardQueryRunnerWorkerResult> {
    if (!this.canWork(options)) {
      return emptyResult();
    }

    const { dashboard, range } = options;

    const annotations = dashboard.annotations.list.filter(AnnotationsWorker.getAnnotationsToProcessFilter);
    const observables = annotations.map((annotation) => {
      const datasourcePromise = getDataSourceService().get(annotation.datasource);
      return from(datasourcePromise).pipe(
        mergeMap((datasource: DataSourceApi) => {
          const runner = this.runners.find((r) => r.canRun(datasource));
          if (!runner) {
            return of([]);
          }

          dashboard.events.publish(new AnnotationQueryStarted(annotation));

          return runner.run({ annotation, datasource, dashboard, range }).pipe(
            takeUntil(
              getDashboardQueryRunner()
                .cancellations()
                .pipe(filter((a) => a === annotation))
            ),
            map((results) => {
              // translate result
              return translateQueryResult(annotation, results);
            }),
            finalize(() => {
              dashboard.events.publish(new AnnotationQueryFinished(annotation));
            })
          );
        })
      );
    });

    return merge(observables).pipe(
      mergeAll(),
      reduce((acc, value) => {
        // should we use scan or reduce here
        // reduce will only emit when all observables are completed
        // scan will emit when any observable is completed
        // choosing reduce to minimize re-renders
        return acc.concat(value);
      }),
      map((annotations) => {
        return { annotations, alertStates: [] };
      })
    );
  }

  private static getAnnotationsToProcessFilter(annotation: AnnotationQuery): boolean {
    return annotation.enable && !Boolean(annotation.snapshotData);
  }
}
