// Libraries
import _ from 'lodash';
// Utils
import kbn from '../library/utils/kbn';

// Types
import {
  dateMath,
  TimeRange,
  RawTimeRange,
  TimeZone,
  toUtc,
  dateTime,
  isDateTime,
} from 'src/packages/datav-core';
import { contextSrv } from './context';
import { getZoomedTimeRange, getShiftedTimeRange } from '../library/utils/timePicker';

import { config} from 'src/packages/datav-core';
import {timer} from './timer'

import { store } from 'src/store/store';
import { updateStartDate,updateEndDate } from 'src/store/reducers/application';
import {addParamsToUrl,getUrlParams,addParamToUrl,removeParamFromUrl} from 'src/core/library/utils/url'

export class TimeSrv {
  time: any;
  refreshTimer: any;
  refresh: string;
  oldRefresh: string;
  timeAtLoad: any;
  timezone: string = 'browser';
  notifyTimeUpdate: (timeRange : TimeRange) =>void | null;
  private autoRefreshBlocked: boolean;


  constructor() {
    this.timezone = config.timePicker.timezone
    
    this.init()
    
    document.addEventListener('visibilitychange', () => {
      if (this.autoRefreshBlocked && document.visibilityState === 'visible') {
        this.autoRefreshBlocked = false;
        this.notifyTimeUpdate(this.timeRange())
      }
    });
  }
  
  init() {
    timer.cancelAll();

    this.time = {
      from : this.parseUrlParam(store.getState().application.startDate),
      to: this.parseUrlParam(store.getState().application.endDate)
    }

    this.refresh = config.timePicker.refresh;

    this.initTimeFromUrl();


    this.parseTime();

    // remember time at load so we can go back to it
    this.timeAtLoad = _.cloneDeep(this.time);

    if (this.refresh) {
      this.setAutoRefresh(this.refresh);
    }
  }
  getValidIntervals(intervals: string[]): string[] {
    if (!contextSrv.minRefreshInterval) {
      return intervals;
    }

    const validIntervals = intervals.filter(str => str !== '').filter(contextSrv.isAllowedInterval);

    if (validIntervals.indexOf(contextSrv.minRefreshInterval) === -1) {
      validIntervals.unshift(contextSrv.minRefreshInterval);
    }
    return validIntervals;
  }

  private parseTime() {
    // when absolute time is saved in json it is turned to a string
    if (_.isString(this.time.from) && this.time.from.indexOf('Z') >= 0) {
      this.time.from = dateTime(this.time.from).utc();
    }
    if (_.isString(this.time.to) && this.time.to.indexOf('Z') >= 0) {
      this.time.to = dateTime(this.time.to).utc();
    }
  }

  private parseUrlParam(value: any) {
    if (value.indexOf('now') !== -1) {
      return value;
    }
    if (value.length === 8) {
      const utcValue = toUtc(value, 'YYYYMMDD');
      if (utcValue.isValid()) {
        return utcValue;
      }
    } else if (value.length === 15) {
      const utcValue = toUtc(value, 'YYYYMMDDTHHmmss');
      if (utcValue.isValid()) {
        return utcValue;
      }
    }

    if (!isNaN(value)) {
      const epoch = parseInt(value, 10);
      return toUtc(epoch);
    }

    return null;
  }


  private initTimeFromUrl() {
    const params = getUrlParams()
    
    if (params.from) {
      this.time.from = this.parseUrlParam(params.from) || this.time.from;
    }
    if (params.to) {
      this.time.to = this.parseUrlParam(params.to) || this.time.to;
    }
    // if absolute ignore refresh option saved to dashboard
    if (params.to && params.to.indexOf('now') === -1) {
      this.refresh = '';
      config.timePicker.refresh = '';
    }
    // but if refresh explicitly set then use that
    if (params.refresh) {
      if (contextSrv.isAllowedInterval(params.refresh)) {
        this.refresh = params.refresh 
      } else {
        this.refresh = config.minRefreshInterval
      }
    }
  }



  setAutoRefresh(interval: string,updateUrl?:boolean) {
    config.timePicker.refresh = interval;
    this.cancelNextRefresh();

    if (interval) {
      const validInterval = contextSrv.getValidInterval(interval);
      const intervalMs = kbn.interval_to_ms(validInterval);

      const t =  setTimeout(() => {
        this.startNextRefreshTimer(intervalMs);
        this.notifyTimeUpdate(this.timeRange())
      }, intervalMs)
      this.refreshTimer = timer.register(t);
    }
    
    // update url inside timeout to so that a digest happens after (called from react)
    if (updateUrl) {
      if (interval !== '') {
        addParamToUrl({refresh:interval})
      } else  {
        removeParamFromUrl(['refresh'])
      }
    }
  }



  private startNextRefreshTimer(afterMs: number) {
    this.cancelNextRefresh();
    const t =  setTimeout(() => {
      this.startNextRefreshTimer(afterMs);
      if (contextSrv.isGrafanaVisible()) {
        this.notifyTimeUpdate(this.timeRange())
      } else {
        this.autoRefreshBlocked = true;
      }
    }, afterMs)
    this.refreshTimer = timer.register( t);
  }

  private cancelNextRefresh() {
    timer.cancel(this.refreshTimer);
  }

  setTime(time: RawTimeRange, updateUrl?:boolean) {
    _.extend(this.time, time);

    // disable refresh if zoom in or zoom out
    if (isDateTime(time.to)) {
      this.oldRefresh = config.timePicker.refresh || this.oldRefresh;
      this.setAutoRefresh('');
    } else if (this.oldRefresh && this.oldRefresh !== config.timePicker.refresh) {
      this.setAutoRefresh(this.oldRefresh);
      this.oldRefresh = null;
    }

    // update url params
    if (updateUrl) {
      addParamsToUrl()
    }

    // save timerange to store
    const from = isDateTime(this.time.from) ? this.time.from.valueOf().toString() : this.time.from
    const to = isDateTime(this.time.to) ? this.time.to.valueOf().toString() : this.time.to
    
    store.dispatch(updateStartDate(from))
    store.dispatch(updateEndDate(to))

    // notify pages to refresh
    if (this.notifyTimeUpdate) {
      this.notifyTimeUpdate(this.timeRange())
    }
  }
  


  timeRangeForUrl = () => {
    const range = this.timeRange().raw;
    
    if (isDateTime(range.from)) {
      range.from = range.from.valueOf().toString();
    }
    if (isDateTime(range.to)) {
      range.to = range.to.valueOf().toString();
    } 
    return range;
  };

  timeRange(): TimeRange {
    // make copies if they are moment  (do not want to return out internal moment, because they are mutable!)
    const raw = {
      from: isDateTime(this.time.from) ? dateTime(this.time.from) : this.time.from,
      to: isDateTime(this.time.to) ? dateTime(this.time.to) : this.time.to,
    };

    const timezone: TimeZone = config.timePicker.timezone
    return {
      from: dateMath.parse(raw.from, false, timezone),
      to: dateMath.parse(raw.to, true, timezone),
      raw: raw,
    };
  }

  zoomOut(factor: number) {
    const range = this.timeRange();
    const { from, to } = getZoomedTimeRange(range, factor);

    this.setTime({ from: toUtc(from), to: toUtc(to) },true);
  }

  shiftTime(direction: number) {
    const range = this.timeRange();
    const { from, to } = getShiftedTimeRange(direction, range);

    this.setTime({
      from: toUtc(from),
      to: toUtc(to),
    },true);
  }
}

let singleton: TimeSrv;

export function setTimeSrv(srv: TimeSrv) {
  singleton = srv;
}

export function getTimeSrv(): TimeSrv {
  return singleton;
}

