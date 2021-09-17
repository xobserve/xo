import { from, merge, MonoTypeOperatorFunction, Observable, of, Subject, Subscription, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, retryWhen, share, takeUntil, tap, throwIfEmpty } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import { v4 as uuidv4 } from 'uuid';
import { BackendSrv as BackendService, BackendSrvRequest, FetchError, FetchResponse } from 'src/packages/datav-core/src/runtime';
import { AppEvents, config, DataQueryErrorType } from 'src/packages/datav-core/src/data';


import { DashboardSearchHit } from 'src/views/search/types';
import { DashboardDataDTO, DashboardDTO, FolderDTO, FolderInfo } from 'src/types';

import { ContextSrv, contextSrv } from '../context';
import { parseInitFromOptions, parseResponseBody, parseUrlFromOptions } from 'src/core/library/utils/fetch';
import { isDataQuery, isLocalUrl } from 'src/core/library/utils/query';
import { FetchQueue } from './fetch_queue';
import { ResponseQueue } from './response_queue';
import { FetchQueueWorker } from './fetch_queue_worker'

import { DataSourceResponse, ShowModalReactEvent } from 'src/types/events';
import appEvents from 'src/core/library/utils/app_events';
import { logout } from 'src/core/library/utils/user';
import { notification } from 'antd';
import { store } from 'src/store/store';
import localeAllData from 'src/core/library/locale'
import { getToken } from 'src/core/library/utils/auth';

const CANCEL_ALL_REQUESTS_REQUEST_ID = 'cancel_all_requests_request_id';

export interface BackendSrvDependencies {
    fromFetch: (input: string | Request, init?: RequestInit) => Observable<Response>;
    appEvents: typeof appEvents;
    contextSrv: ContextSrv;
    logout: () => void;
}

interface FetchResponseProps {
    message?: string;
}


interface ErrorResponseProps extends FetchResponseProps {
    status?: string;
    error?: string | any;
}

interface ErrorResponse<T extends ErrorResponseProps = any> {
    status: number;
    statusText?: string;
    isHandled?: boolean;
    data: T | string;
    cancelled?: boolean;
}

export class BackendSrv implements BackendService {
    private inFlightRequests: Subject<string> = new Subject<string>();
    private HTTP_REQUEST_CANCELED = -1;
    private noBackendCache: boolean;
    private inspectorStream: Subject<FetchResponse | FetchError> = new Subject<FetchResponse | FetchError>();
    private readonly fetchQueue: FetchQueue;
    private readonly responseQueue: ResponseQueue;

    private dependencies: BackendSrvDependencies = {
        fromFetch: fromFetch,
        appEvents: appEvents,
        contextSrv: contextSrv,
        logout: () => {
        },
    };

    constructor(deps?: BackendSrvDependencies) {
        if (deps) {
            this.dependencies = {
                ...this.dependencies,
                ...deps,
            };
        }

        this.noBackendCache = false;
        this.internalFetch = this.internalFetch.bind(this);
        this.fetchQueue = new FetchQueue();
        this.responseQueue = new ResponseQueue(this.fetchQueue, this.internalFetch);
        new FetchQueueWorker(this.fetchQueue, this.responseQueue);
    }

    async request<T = any>(options: BackendSrvRequest): Promise<T> {
        return this.fetch<T>(options)
            .pipe(map((response: FetchResponse<T>) => response.data))
            .toPromise();
    }

    fetch<T>(options: BackendSrvRequest): Observable<FetchResponse<T>> {
        // We need to match an entry added to the queue stream with the entry that is eventually added to the response stream
        const id = uuidv4();
        const fetchQueue = this.fetchQueue;

        return new Observable((observer) => {
            // Subscription is an object that is returned whenever you subscribe to an Observable.
            // You can also use it as a container of many subscriptions and when it is unsubscribed all subscriptions within are also unsubscribed.
            const subscriptions: Subscription = new Subscription();

            // We're using the subscriptions.add function to add the subscription implicitly returned by this.responseQueue.getResponses<T>(id).subscribe below.
            subscriptions.add(
                this.responseQueue.getResponses<T>(id).subscribe((result) => {
                    // The one liner below can seem magical if you're not accustomed to RxJs.
                    // Firstly, we're subscribing to the result from the result.observable and we're passing in the outer observer object.
                    // By passing the outer observer object then any updates on result.observable are passed through to any subscriber of the fetch<T> function.
                    // Secondly, we're adding the subscription implicitly returned by result.observable.subscribe(observer).
                    subscriptions.add(result.observable.subscribe(observer));
                })
            );

            // Let the fetchQueue know that this id needs to start data fetching.
            this.fetchQueue.add(id, options);

            // This returned function will be called whenever the returned Observable from the fetch<T> function is unsubscribed/errored/completed/canceled.
            return function unsubscribe() {
                // Change status to Done moved here from ResponseQueue because this unsubscribe was called before the responseQueue produced a result
                fetchQueue.setDone(id);

                // When subscriptions is unsubscribed all the implicitly added subscriptions above are also unsubscribed.
                subscriptions.unsubscribe();
            };
        });
    }

    private internalFetch<T>(options: BackendSrvRequest): Observable<FetchResponse<T>> {
        if (options.requestId) {
            this.inFlightRequests.next(options.requestId);
        }

        options = this.parseRequestOptions(options);

        const fromFetchStream = this.getFromFetchStream(options);
        const failureStream = fromFetchStream.pipe(this.toFailureStream(options));
        const successStream = fromFetchStream.pipe(
            filter((response) => response.ok === true),
            // map(response => {
            //     // show response message
            //     if (response.data) {
            //       this.showMessage(response.data, 'info')
            //     }
        
            //     const fetchSuccessResponse = response.data;
            //     // 
            //     return fetchSuccessResponse;
            //   }),
            tap((response) => {
                this.showSuccessAlert(response);
                this.inspectorStream.next(response);
            })
        );

        return merge(successStream, failureStream).pipe(
            catchError((err: FetchError) => throwError(this.processRequestError(options, err))),
            this.handleStreamCancellation(options)
        );
    }

    resolveCancelerIfExists(requestId: string) {
        this.inFlightRequests.next(requestId);
    }

    cancelAllInFlightRequests() {
        this.inFlightRequests.next(CANCEL_ALL_REQUESTS_REQUEST_ID);
    }

    async datasourceRequest(options: BackendSrvRequest): Promise<any> {
        return this.fetch(options).toPromise();
    }

    private parseRequestOptions = (options: BackendSrvRequest): BackendSrvRequest => {
        options.retry = options.retry ?? 0;
        const requestIsLocal = !options.url.match(/^http/);

        if (requestIsLocal) {
            if (options.url.startsWith('/')) {
                options.url = options.url.substring(1);
            }

            if (options.url.endsWith('/')) {
                options.url = options.url.slice(0, -1);
            }
        }

        return options;
    };



    private getFromFetchStream = (options: BackendSrvRequest) => {
        // add token to headers 
        options.headers === undefined ? options.headers = { 'X-Token': getToken() } : options.headers['X-Token'] = getToken()
    
        let url = parseUrlFromOptions(options);
        const requestIsLocal = !options.url.match(/^http/);
        if (requestIsLocal) {
          url = config.baseUrl + url
        }
    
        const init = parseInitFromOptions(options);
        return this.dependencies.fromFetch(url, init).pipe(
          mergeMap(async response => {
            const { status, statusText, ok, headers, url, type, redirected } = response;
            const textData = await response.text(); // this could be just a string, prometheus requests for instance
            let data;
            try {
              data = JSON.parse(textData); // majority of the requests this will be something that can be parsed
            } catch {
              data = textData;
            }
            const fetchResponse: FetchResponse = {
              status,
              statusText,
              ok,
              data,
              headers,
              url,
              type,
              redirected,
              config: options,
            };
            return fetchResponse;
          }),
          share() // sharing this so we can split into success and failure and then merge back
        );
      };

    private toFailureStream = (options: BackendSrvRequest): MonoTypeOperatorFunction<FetchResponse> => inputStream =>
        inputStream.pipe(
            filter(response => response.ok === false),
            mergeMap(response => {
                const fetchErrorResponse = this.handleErrorResponse(response)
                return throwError(fetchErrorResponse);
            })
        );


    private handleErrorResponse(response: DataSourceResponse<any>): ErrorResponse {
        const { status, statusText, data } = response;
        this.showMessage(data, 'error')

        const fetchErrorResponse: ErrorResponse = { status, statusText, data };

        if (status === 401) { // need login
            setTimeout(logout, 1000)
        }

        return fetchErrorResponse
    }


    private showMessage(data: any, level: string) {
        if (!data.message) {
            return
        }

        let msg = data.message;
        if (data.i18n) {
            const msgid = data.message
            msg = this.getI18nMessage(msgid)
        }

        level === 'error' ? notification['error']({
            message: "Error",
            description: msg,
            duration: 5
        }) : notification['info']({
            message: "Info",
            description: msg,
            duration: 5
        });
    }

    private getI18nMessage(msgid: string): string {
        const localeData = localeAllData[store.getState().application.locale]
        if (!localeData) {
            return 'Cant find data with language: ' + store.getState().application.locale
        }
        const content = localeData[msgid]
        if (!content) {
            return 'Cant find msg content with msgid: ' + msgid
        }
        return content
    }


    showApplicationErrorAlert(err: FetchError) { }

    showSuccessAlert<T>(response: FetchResponse<T>) {
        const { config } = response;
        if (config.showSuccessAlert === false) {
            return;
        }

        // is showSuccessAlert is undefined we only show alerts non GET request, non data query and local api requests
        if (
            config.showSuccessAlert === undefined &&
            (config.method === 'GET' || isDataQuery(config.url) || !isLocalUrl(config.url))
        ) {
            return;
        }

        const data: { message: string } = response.data as any;

        if (data?.message) {
            this.dependencies.appEvents.emit(AppEvents.alertSuccess, [data.message]);
        }
    }

    showErrorAlert<T>(config: BackendSrvRequest, err: FetchError) {
        if (config.showErrorAlert === false) {
            return;
        }

        // is showErrorAlert is undefined we only show alerts non data query and local api requests
        if (config.showErrorAlert === undefined && (isDataQuery(config.url) || !isLocalUrl(config.url))) {
            return;
        }

        let description = '';
        let message = err.data.message;

        if (message.length > 80) {
            description = message;
            message = 'Error';
        }

        // Validation
        if (err.status === 422) {
            message = 'Validation failed';
        }

        this.dependencies.appEvents.emit(err.status < 500 ? AppEvents.alertWarning : AppEvents.alertError, [
            message,
            description,
        ]);
    }

    /**
     * Processes FetchError to ensure "data" property is an object.
     *
     * @see DataQueryError.data
     */
    processRequestError(options: BackendSrvRequest, err: FetchError): FetchError<{ message: string; error?: string }> {
        err.data = err.data ?? { message: 'Unexpected error' };

        if (typeof err.data === 'string') {
            err.data = {
                message: err.data,
                error: err.statusText,
                response: err.data,
            };
        }

        // If no message but got error string, copy to message prop
        if (err.data && !err.data.message && typeof err.data.error === 'string') {
            err.data.message = err.data.error;
        }

        // check if we should show an error alert
        if (err.data.message) {
            setTimeout(() => {
                if (!err.isHandled) {
                    this.showErrorAlert(options, err);
                }
            }, 50);
        }

        this.inspectorStream.next(err);
        return err;
    }

    private handleStreamCancellation(options: BackendSrvRequest): MonoTypeOperatorFunction<FetchResponse<any>> {
        return (inputStream) =>
            inputStream.pipe(
                takeUntil(
                    this.inFlightRequests.pipe(
                        filter((requestId) => {
                            let cancelRequest = false;

                            if (options && options.requestId && options.requestId === requestId) {
                                // when a new requestId is started it will be published to inFlightRequests
                                // if a previous long running request that hasn't finished yet has the same requestId
                                // we need to cancel that request
                                cancelRequest = true;
                            }

                            if (requestId === CANCEL_ALL_REQUESTS_REQUEST_ID) {
                                cancelRequest = true;
                            }

                            return cancelRequest;
                        })
                    )
                ),
                // when a request is cancelled by takeUntil it will complete without emitting anything so we use throwIfEmpty to identify this case
                // in throwIfEmpty we'll then throw an cancelled error and then we'll return the correct result in the catchError or rethrow
                throwIfEmpty(() => ({
                    type: DataQueryErrorType.Cancelled,
                    cancelled: true,
                    data: null,
                    status: this.HTTP_REQUEST_CANCELED,
                    statusText: 'Request was aborted',
                    config: options,
                }))
            );
    }

    getInspectorStream(): Observable<FetchResponse<any> | FetchError> {
        return this.inspectorStream;
    }

    async get<T = any>(url: string, params?: any, requestId?: string): Promise<T> {
        return await this.request({ method: 'GET', url, params, requestId });
    }

    async delete(url: string) {
        return await this.request({ method: 'DELETE', url });
    }

    async post(url: string, data?: any) {
        return await this.request({ method: 'POST', url, data });
    }

    async patch(url: string, data: any) {
        return await this.request({ method: 'PATCH', url, data });
    }

    async put(url: string, data: any) {
        return await this.request({ method: 'PUT', url, data });
    }

    withNoBackendCache(callback: any) {
        this.noBackendCache = true;
        return callback().finally(() => {
            this.noBackendCache = false;
        });
    }

    loginPing() {
        return this.request({ url: '/api/login/ping', method: 'GET', retry: 1 });
    }

    search(query: any){
        return this.get('/api/search', query);
    }

    getDashboardByUid(uid: string) {
        return this.get(`/api/dashboards/uid/${uid}`);
    }

    getFolderByUid(uid: string) {
        return this.get<FolderDTO>(`/api/folders/${uid}`);
    }

    saveDashboard(
        dashboard: DashboardDataDTO,
        { message = '', folderId, overwrite = false,fromTeam=0,alertChanged=false}: { message?: string; folderId?: number; overwrite?: boolean;fromTeam?:number;alertChanged?:boolean} = {}
      ) {
        return this.post('/api/dashboard/save', {
          dashboard,
          folderId,
          overwrite,
          message,
          fromTeam,
          alertChanged
        });
      }

      private createTask(fn: (...args: any[]) => Promise<any>, ignoreRejections: boolean, ...args: any[]) {
        return async (result: any) => {
          try {
            const res = await fn(...args);
            return Array.prototype.concat(result, [res]);
          } catch (err) {
            if (ignoreRejections) {
              return result;
            }
    
            throw err;
          }
        };
      }

      private executeInOrder(tasks: any[]) {
        return tasks.reduce((acc, task) => {
          return Promise.resolve(acc).then(task);
        }, []);
      }

      deleteFolder(uid: string, showSuccessAlert: boolean) {
        return this.request({ method: 'DELETE', url: `/api/folders/${uid}`, showSuccessAlert: showSuccessAlert === true });
      }
    
      deleteDashboard(uid: string, showSuccessAlert: boolean) {
        return this.request({
          method: 'DELETE',
          url: `/api/dashboard/uid/${uid}`,
          showSuccessAlert: showSuccessAlert === true,
        });
      }

      deleteFoldersAndDashboards(folderUids: string[], dashboardUids: string[]) {
        const tasks = [];
    
        for (const folderUid of folderUids) {
          tasks.push(this.createTask(this.deleteFolder.bind(this), true, folderUid, true));
        }
    
        for (const dashboardUid of dashboardUids) {
          tasks.push(this.createTask(this.deleteDashboard.bind(this), true, dashboardUid, true));
        }
    
        return this.executeInOrder(tasks);
      }

      moveDashboards(dashboardUids: string[], toFolder: FolderInfo) {
        const tasks = [];
    
        for (const uid of dashboardUids) {
          tasks.push(this.createTask(this.moveDashboard.bind(this), true, uid, toFolder));
        }
    
        return this.executeInOrder(tasks).then((result: any) => {
          return {
            totalCount: result.length,
            successCount: result.filter((res: any) => res.succeeded).length,
            alreadyInFolderCount: result.filter((res: any) => res.alreadyInFolder).length,
          };
        });
      }
    
      private async moveDashboard(uid: string, toFolder: FolderInfo) {
        const res = await this.getDashboardByUid(uid);
        const fullDash: DashboardDTO = res.data
    
        if ((!fullDash.meta.folderId && toFolder.id === 0) || fullDash.meta.folderId === toFolder.id) {
          return { alreadyInFolder: true };
        }
    
        const clone = fullDash.dashboard;
        const options = {
          folderId: toFolder.id,
          overwrite: false,
        };
    
        try {
          await this.saveDashboard(clone, options);
          return { succeeded: true };
        } catch (err) {
          if (err.data?.status !== 'plugin-dashboard') {
            return { succeeded: false };
          }
    
          err.isHandled = true;
          options.overwrite = true;
    
          try {
            await this.saveDashboard(clone, options);
            return { succeeded: true };
          } catch (e) {
            return { succeeded: false };
          }
        }
      }
}

// Used for testing and things that really need BackendSrv
export const backendSrv = new BackendSrv();
export const getBackendSrv = (): BackendSrv => backendSrv;
