export interface ClockOptions {
  mode: ClockMode;
  clockType: ClockType;
  timezone?: string;
  bgColor?: string;
  countdownSettings: CountdownSettings;
  dateSettings: DateSettings;
  timeSettings: TimeSettings;
  timezoneSettings: TimezoneSettings;
  refreshSettings: RefreshSettings;
}

export enum ClockMode {
  time = 'time',
  countdown = 'countdown',
}

export enum ClockType {
  H24 = '24 hour',
  H12 = '12 hour',
  Custom = 'custom',
}

export enum ZoneFormat {
  name = 'name',
  nameOffset = 'nameOffset',
  offsetAbbv = 'offsetAbbv',
  offset = 'offset',
  abbv = 'abbv',
}

export enum FontWeight {
  normal = 'normal',
  bold = 'bold',
}

interface CountdownSettings {
  endCountdownTime: any;
  endText: string;
  customFormat?: string;
}

interface DateSettings {
  showDate: boolean;
  dateFormat: string;
  locale: string;
  fontSize: string;
  fontWeight: FontWeight;
}

interface TimeSettings {
  customFormat?: string;
  fontSize: string;
  fontWeight: FontWeight;
}

interface TimezoneSettings {
  showTimezone: boolean;
  zoneFormat: ZoneFormat;
  fontSize: string;
  fontWeight: FontWeight;
}

interface RefreshSettings {
  syncWithDashboard: boolean;
}
