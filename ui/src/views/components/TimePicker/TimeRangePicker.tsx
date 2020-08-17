// Libraries
import React, { PureComponent, memo } from 'react';
import { css, cx } from 'emotion';
// Components
import { Tooltip, Button } from 'antd';
import { UpOutlined, DownOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import { TimePickerContent } from './TimePickerContent/TimePickerContent';

// Types
import { isDateTime, rangeUtil, dateTimeFormat, timeZoneFormatUserFriendly,stylesFactory,ClickOutsideWrapper} from 'src/packages/datav-core';
import { TimeRange, TimeOption, TimeZone, dateMath } from 'src/packages/datav-core';

const quickOptions: TimeOption[] = [
  { from: 'now-5m', to: 'now', display: 'Last 5 minutes', section: 3 },
  { from: 'now-15m', to: 'now', display: 'Last 15 minutes', section: 3 },
  { from: 'now-30m', to: 'now', display: 'Last 30 minutes', section: 3 },
  { from: 'now-1h', to: 'now', display: 'Last 1 hour', section: 3 },
  { from: 'now-3h', to: 'now', display: 'Last 3 hours', section: 3 },
  { from: 'now-6h', to: 'now', display: 'Last 6 hours', section: 3 },
  { from: 'now-12h', to: 'now', display: 'Last 12 hours', section: 3 },
  { from: 'now-24h', to: 'now', display: 'Last 24 hours', section: 3 },
  { from: 'now-2d', to: 'now', display: 'Last 2 days', section: 3 },
  { from: 'now-7d', to: 'now', display: 'Last 7 days', section: 3 },
  { from: 'now-30d', to: 'now', display: 'Last 30 days', section: 3 },
  { from: 'now-90d', to: 'now', display: 'Last 90 days', section: 3 },
  { from: 'now-6M', to: 'now', display: 'Last 6 months', section: 3 },
  { from: 'now-1y', to: 'now', display: 'Last 1 year', section: 3 },
  { from: 'now-2y', to: 'now', display: 'Last 2 years', section: 3 },
  { from: 'now-5y', to: 'now', display: 'Last 5 years', section: 3 },
];

const otherOptions: TimeOption[] = [
  { from: 'now-1d/d', to: 'now-1d/d', display: 'Yesterday', section: 3 },
  { from: 'now-2d/d', to: 'now-2d/d', display: 'Day before yesterday', section: 3 },
  { from: 'now-7d/d', to: 'now-7d/d', display: 'This day last week', section: 3 },
  { from: 'now-1w/w', to: 'now-1w/w', display: 'Previous week', section: 3 },
  { from: 'now-1M/M', to: 'now-1M/M', display: 'Previous month', section: 3 },
  { from: 'now-1y/y', to: 'now-1y/y', display: 'Previous year', section: 3 },
  { from: 'now/d', to: 'now/d', display: 'Today', section: 3 },
  { from: 'now/d', to: 'now', display: 'Today so far', section: 3 },
  { from: 'now/w', to: 'now/w', display: 'This week', section: 3 },
  { from: 'now/w', to: 'now', display: 'This week so far', section: 3 },
  { from: 'now/M', to: 'now/M', display: 'This month', section: 3 },
  { from: 'now/M', to: 'now', display: 'This month so far', section: 3 },
  { from: 'now/y', to: 'now/y', display: 'This year', section: 3 },
  { from: 'now/y', to: 'now', display: 'This year so far', section: 3 },
];


const getStyles = stylesFactory(() => {
  return {
    container: css`
      position: relative;
      flex-flow: column nowrap;
    `,
    buttons: css`
      display: -webkit-box;
    `,
    caretIcon: css`
      margin-left: 4px;
    `,
    clockIcon: css`
      margin-left: 4px;
      margin-right: 4px;
    `,
    noRightBorderStyle: css`
      label: noRightBorderStyle;
      border-right: 0;
    `,
  };
});

const getLabelStyles = stylesFactory(() => {
  return {
    container: css`
      display: inline-block;
    `,
    utc: css`
      color: #eb7b18;
      font-size: 75%;
      padding: 3px;
      font-weight: 500;
    `,
  };
});



export interface State {
  isOpen: boolean;
}

export interface Props {
  hideText?: boolean;
  value: TimeRange;
  timeZone?: TimeZone;
  timeSyncButton?: JSX.Element;
  isSynced?: boolean;
  onChange: (timeRange: TimeRange) => void;
  onMoveBackward: () => void;
  onMoveForward: () => void;
  onZoom: () => void;
}


export class UnthemedTimeRangePicker extends PureComponent<Props&any, State> {
  state: State = {
    isOpen: false,
  };

  onChange = (timeRange: TimeRange) => {
    this.props.onChange(timeRange);
    this.setState({ isOpen: false });
  };

  onOpen = (event) => {
    const { isOpen } = this.state;
    event.stopPropagation();
    this.setState({ isOpen: !isOpen });
  };

  onClose = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const {
      value,
      onMoveBackward,
      onMoveForward,
      timeZone,
      timeSyncButton,
      isSynced
    } = this.props;

    const { isOpen } = this.state;
    const styles = getStyles();
    const hasAbsolute = isDateTime(value.raw.from) || isDateTime(value.raw.to);
    const syncedTimePicker = timeSyncButton && isSynced;
    const timePickerIconClass = cx({ 'icon-brand-gradient': syncedTimePicker });

    return (
      <div className={styles.container}>
        <div className={styles.buttons}>
          {hasAbsolute && (
            <Button  onClick={onMoveBackward}>
              <LeftOutlined />
            </Button>
          )}
          <div>
            <Tooltip title={<TimePickerTooltip timeRange={value} timeZone={timeZone} />} placement="bottom">
              <Button aria-label="TimePicker Open Button" onClick={this.onOpen}>
                <ClockCircleOutlined className={cx(styles.clockIcon, timePickerIconClass)} />
                <TimePickerButtonLabel {...this.props} />
                <span className={styles.caretIcon}>{isOpen ? <UpOutlined /> : <DownOutlined />}</span>
              </Button>
            </Tooltip>
            {isOpen && (
              <ClickOutsideWrapper onClick={this.onClose}>
                <TimePickerContent
                  timeZone={timeZone}
                  value={value}
                  onChange={this.onChange}
                  otherOptions={otherOptions}
                  quickOptions={quickOptions}
                />
              </ClickOutsideWrapper>
            )}
          </div>

          {timeSyncButton}

          {hasAbsolute && (
            <Button  onClick={onMoveForward}>
              <RightOutlined />
            </Button>
          )}
        </div>
      </div>
    );
  }
}

const TimePickerTooltip = ({ timeRange, timeZone }: { timeRange: TimeRange; timeZone?: TimeZone }) => {
  const styles = getLabelStyles();

  return (
    <>
      {dateTimeFormat(timeRange.from, { timeZone })}
      <div className="text-center">to</div>
      {dateTimeFormat(timeRange.to, { timeZone })}
      <div className="text-center">
        <span className={styles.utc}>{timeZoneFormatUserFriendly(timeZone)}</span>
      </div>
    </>
  );
};


const TimePickerButtonLabel = memo<Props & any>(({ hideText, value, timeZone }) => {
  const styles = getLabelStyles();

  if (hideText) {
    return null;
  }

  return (
    <span className={styles.container}>
      <span>{formattedRange(value, timeZone)}</span>
      <span className={styles.utc}>{rangeUtil.describeTimeRangeAbbrevation(value, timeZone)}</span>
    </span>
  );
});

const formattedRange = (value: TimeRange, timeZone?: TimeZone) => {
  const adjustedTimeRange = {
    to: dateMath.isMathString(value.raw.to) ? value.raw.to : value.to,
    from: dateMath.isMathString(value.raw.from) ? value.raw.from : value.from,
  };
  return rangeUtil.describeTimeRange(adjustedTimeRange, timeZone);
};

export const TimeRangePicker = UnthemedTimeRangePicker;
