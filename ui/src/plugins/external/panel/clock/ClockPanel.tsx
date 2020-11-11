import React, { PureComponent } from 'react';
import { PanelProps } from 'src/packages/datav-core/src';
import { ClockOptions, ClockType, ZoneFormat, ClockMode } from './types';
import { css } from 'emotion';

// eslint-disable-next-line
import moment, { Moment } from 'moment';
import './external/moment-duration-format';

interface Props extends PanelProps<ClockOptions> {}
interface State {
  // eslint-disable-next-line
  now: Moment;
}

export function getTimeZoneNames(): string[] {
  return (moment as any).tz.names();
}

export class ClockPanel extends PureComponent<Props, State> {
  timerID?: any;
  state = { now: this.getTZ(), timezone: '' };

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000 // 1 second
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    const { timezone } = this.props.options;
    this.setState({ now: this.getTZ(timezone) });
  }

  getTimeFormat() {
    const { clockType, timeSettings } = this.props.options;

    if (clockType === ClockType.Custom && timeSettings.customFormat) {
      return timeSettings.customFormat;
    }

    if (clockType === ClockType.H12) {
      return 'h:mm:ss A';
    }

    return 'HH:mm:ss';
  }

  // Return a new moment instnce in the selected timezone
  // eslint-disable-next-line
  getTZ(tz?: string): Moment {
    if (!tz) {
      tz = (moment as any).tz.guess();
    }
    return (moment() as any).tz(tz);
  }

  getCountdownText(): string {
    const { now } = this.state;
    const { countdownSettings, timezone } = this.props.options;

    if (!countdownSettings.endCountdownTime) {
      return countdownSettings.endText;
    }

    const timeLeft = moment.duration(
      moment(countdownSettings.endCountdownTime)
        .utcOffset(this.getTZ(timezone).format('Z'), true)
        .diff(now)
    );
    let formattedTimeLeft = '';

    if (timeLeft.asSeconds() <= 0) {
      return countdownSettings.endText;
    }

    if (countdownSettings.customFormat === 'auto') {
      return (timeLeft as any).format();
    }

    if (countdownSettings.customFormat) {
      return (timeLeft as any).format(countdownSettings.customFormat);
    }

    let previous = '';

    if (timeLeft.years() > 0) {
      formattedTimeLeft = timeLeft.years() === 1 ? '1 year, ' : timeLeft.years() + ' years, ';
      previous = 'years';
    }
    if (timeLeft.months() > 0 || previous === 'years') {
      formattedTimeLeft += timeLeft.months() === 1 ? '1 month, ' : timeLeft.months() + ' months, ';
      previous = 'months';
    }
    if (timeLeft.days() > 0 || previous === 'months') {
      formattedTimeLeft += timeLeft.days() === 1 ? '1 day, ' : timeLeft.days() + ' days, ';
      previous = 'days';
    }
    if (timeLeft.hours() > 0 || previous === 'days') {
      formattedTimeLeft += timeLeft.hours() === 1 ? '1 hour, ' : timeLeft.hours() + ' hours, ';
      previous = 'hours';
    }

    if (timeLeft.minutes() > 0 || previous === 'hours') {
      formattedTimeLeft += timeLeft.minutes() === 1 ? '1 minute, ' : timeLeft.minutes() + ' minutes, ';
    }

    formattedTimeLeft += timeLeft.seconds() === 1 ? '1 second ' : timeLeft.seconds() + ' seconds';
    return formattedTimeLeft;
  }

  renderZone() {
    const { now } = this.state;
    const { timezoneSettings } = this.props.options;
    const { zoneFormat } = timezoneSettings;

    const clazz = css`
      font-size: ${timezoneSettings.fontSize};
      font-weight: ${timezoneSettings.fontWeight};
      line-height: 1.4;
    `;

    let zone = this.props.options.timezone || '';

    switch (zoneFormat) {
      case ZoneFormat.offsetAbbv:
        zone = now.format('Z z');
        break;
      case ZoneFormat.offset:
        zone = now.format('Z');
        break;
      case ZoneFormat.abbv:
        zone = now.format('z');
        break;
      default:
        try {
          zone = (this.getTZ(zone) as any)._z.name;
        } catch (e) {
          console.log('Error getting timezone', e);
        }
    }

    return (
      <h4 className={clazz}>
        {zone}
        {zoneFormat === ZoneFormat.nameOffset && (
          <>
            <br />({now.format('Z z')})
          </>
        )}
      </h4>
    );
  }

  renderDate() {
    const { now } = this.state;
    const { dateSettings } = this.props.options;

    const clazz = css`
      font-size: ${dateSettings.fontSize};
      font-weight: ${dateSettings.fontWeight};
    `;

    const disp = now.locale(dateSettings.locale || '').format(dateSettings.dateFormat);
    return (
      <span>
        <h3 className={clazz}>{disp}</h3>
      </span>
    );
  }

  renderTime() {
    const { now } = this.state;
    const { timeSettings, mode } = this.props.options;

    const clazz = css`
      font-size: ${timeSettings.fontSize};
      font-weight: ${timeSettings.fontWeight};
    `;

    const disp = mode === ClockMode.countdown ? this.getCountdownText() : now.format(this.getTimeFormat());
    return <h2 className={clazz}>{disp}</h2>;
  }

  render() {
    const { options, width, height } = this.props;
    const { bgColor, dateSettings, timezoneSettings } = options;

    const clazz = css`
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background-color: ${bgColor ?? ''};
      text-align: center;
    `;

    return (
      <div
        className={clazz}
        style={{
          width,
          height,
        }}
      >
        {dateSettings.showDate && this.renderDate()}
        {this.renderTime()}
        {timezoneSettings.showTimezone && this.renderZone()}
      </div>
    );
  }
}
