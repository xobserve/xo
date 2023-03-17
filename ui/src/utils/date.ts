import moment from 'moment'

moment.locale('zh-cn', {
  months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
  weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
  weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'YYYY-MM-DD',
    LL: 'YYYY年MM月DD日',
    LLL: 'YYYY年MM月DD日Ah点mm分',
    LLLL: 'YYYY年MM月DD日ddddAh点mm分',
    l: 'YYYY-M-D',
    ll: 'YYYY年M月D日',
    lll: 'YYYY年M月D日 HH:mm',
    llll: 'YYYY年M月D日dddd HH:mm'
  },
  meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
  meridiemHour: function (hour, meridiem) {
    if (hour === 12) {
      hour = 0;
    }
    if (meridiem === '凌晨' || meridiem === '早上' ||
      meridiem === '上午') {
      return hour;
    } else if (meridiem === '下午' || meridiem === '晚上') {
      return hour + 12;
    } else {
      // '中午'
      return hour >= 11 ? hour : hour + 12;
    }
  },
  meridiem: function (hour, minute, isLower) {
    const hm = hour * 100 + minute;
    if (hm < 600) {
      return '凌晨';
    } else if (hm < 900) {
      return '早上';
    } else if (hm < 1130) {
      return '上午';
    } else if (hm < 1230) {
      return '中午';
    } else if (hm < 1800) {
      return '下午';
    } else {
      return '晚上';
    }
  },
  calendar: {
    sameDay: '[今天]LT',
    nextDay: '[明天]LT',
    nextWeek: '[下]ddddLT',
    lastDay: '[昨天]LT',
    lastWeek: '[上]ddddLT',
    sameElse: 'L'
  },
  dayOfMonthOrdinalParse: /\d{1,2}(日|月|周)/,
  //@ts-ignore
  ordinal: function (number, period) {
    switch (period) {
      case 'd':
      case 'D':
      case 'DDD':
        return number + '日';
      case 'M':
        return number + '月';
      case 'w':
      case 'W':
        return number + '周';
      default:
        return number;
    }
  },
  relativeTime: {
    future: '%s内',
    past: '%s前',
    s: '几秒',
    ss: '%d 秒',
    m: '1 分钟',
    mm: '%d 分钟',
    h: '1 小时',
    hh: '%d 小时',
    d: '1 天',
    dd: '%d 天',
    M: '1 个月',
    MM: '%d 个月',
    y: '1 年',
    yy: '%d 年'
  },
  week: {
    // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  }
})

import { isNullOrUndefined } from './is'

export const getNowMon = () => moment()
export const getNow = (format = 'YYYY-MM-DD HH:mm:ss') =>
  getNowMon().format(format)

export const formatTimestamp = (timestamp: number, format = 'MM-DD HH:mm') => {
  if (isNullOrUndefined(timestamp)) {
    return '-'
  }
  if (String(timestamp).length === 10) {
    timestamp = timestamp * 1000
  }
  return moment(timestamp).format(format)
}

export const formatSeconds = (seconds: number, split = ':') => {
  if (isNullOrUndefined(seconds) || Number.isNaN(seconds)) {
    return '-'
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(split)
}

export const fromNow = (t) => {
  return moment(t).fromNow()
}



export const dateTimeFormat = (dateInUtc, options?) =>
  moment.utc(dateInUtc).local().format(getFormat(options));



const getFormat = (options?): string => {
  return options?.format ?? systemDateFormats.fullDate;
};



export interface SystemDateFormatSettings {
  fullDate: string;
  interval: {
    millisecond: string;
    second: string;
    minute: string;
    hour: string;
    day: string;
    month: string;
    year: string;
  };
  useBrowserLocale: boolean;
}

const DEFAULT_SYSTEM_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DEFAULT_SYSTEM_DATE_MS_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';

export class SystemDateFormatsState {
  fullDate = DEFAULT_SYSTEM_DATE_FORMAT;
  fullDateMS = DEFAULT_SYSTEM_DATE_MS_FORMAT;
  interval = {
    millisecond: 'HH:mm:ss.SSS',
    second: 'HH:mm:ss',
    minute: 'HH:mm',
    hour: 'MM/DD HH:mm',
    day: 'MM/DD',
    month: 'YYYY-MM',
    year: 'YYYY',
  };

  update(settings: SystemDateFormatSettings) {
    this.fullDate = settings.fullDate;
    this.interval = settings.interval;

    if (settings.useBrowserLocale) {
      this.useBrowserLocale();
    }
  }

  useBrowserLocale() {
    this.fullDate = localTimeFormat({
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // ES5 doesn't support `DateTimeFormatOptions.fractionalSecondDigits` so we have to use
    // a hack with string replacement.
    this.fullDateMS = this.fullDate.replace('ss', 'ss.SSS');

    this.interval.millisecond = localTimeFormat(
      { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
      null,
      this.interval.second
    ).replace('ss', 'ss.SSS');
    this.interval.second = localTimeFormat(
      { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false },
      null,
      this.interval.second
    );
    this.interval.minute = localTimeFormat(
      { hour: '2-digit', minute: '2-digit', hour12: false },
      null,
      this.interval.minute
    );
    this.interval.hour = localTimeFormat(
      { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false },
      null,
      this.interval.hour
    );
    this.interval.day = localTimeFormat({ month: '2-digit', day: '2-digit', hour12: false }, null, this.interval.day);
    this.interval.month = localTimeFormat(
      { year: 'numeric', month: '2-digit', hour12: false },
      null,
      this.interval.month
    );
  }

  getTimeFieldUnit(useMsResolution?: boolean) {
    return `time:${useMsResolution ? this.fullDateMS : this.fullDate}`;
  }
}

/**
 * localTimeFormat helps to generate date formats for momentjs based on browser's locale
 *
 * @param locale browser locale, or default
 * @param options DateTimeFormatOptions to format date
 * @param fallback default format if Intl API is not present
 */
export function localTimeFormat(
  options: Intl.DateTimeFormatOptions,
  locale?: string | string[] | null,
  fallback?: string
): string {
  if (missingIntlDateTimeFormatSupport()) {
    return fallback ?? DEFAULT_SYSTEM_DATE_FORMAT;
  }

  if (!locale && navigator) {
    locale = [...navigator.languages];
  }

  // https://momentjs.com/docs/#/displaying/format/
  const dateTimeFormat = new Intl.DateTimeFormat(locale || undefined, options);
  const parts = dateTimeFormat.formatToParts(new Date());
  const hour12 = dateTimeFormat.resolvedOptions().hour12;

  const mapping: { [key: string]: string } = {
    year: 'YYYY',
    month: 'MM',
    day: 'DD',
    hour: hour12 ? 'hh' : 'HH',
    minute: 'mm',
    second: 'ss',
    weekday: 'ddd',
    era: 'N',
    dayPeriod: 'A',
    timeZoneName: 'Z',
  };

  return parts.map((part) => mapping[part.type] || part.value).join('');
}

export const systemDateFormats = new SystemDateFormatsState();

const missingIntlDateTimeFormatSupport = (): boolean => {
  return !('DateTimeFormat' in Intl) || !('formatToParts' in Intl.DateTimeFormat.prototype);
};
