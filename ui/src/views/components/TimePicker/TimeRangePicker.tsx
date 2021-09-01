// Libraries
import React, { PureComponent, memo } from 'react';
import { css, cx } from 'emotion';
// Components
import { Tooltip, Button } from 'antd';
import { UpOutlined, DownOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import { TimePickerContent } from './TimePickerContent/TimePickerContent';

// Types
import { isDateTime, rangeUtil, dateTimeFormat} from 'src/packages/datav-core/src';
import { TimeRange, TimeOption, TimeZone, dateMath } from 'src/packages/datav-core/src';
import {stylesFactory,ClickOutsideWrapper} from 'src/packages/datav-core/src/ui';

const quickOptions: TimeOption[] = [
  { from: 'now-5m', to: 'now', display: 'Last 5 minutes' },
  { from: 'now-15m', to: 'now', display: 'Last 15 minutes' },
  { from: 'now-30m', to: 'now', display: 'Last 30 minutes' },
  { from: 'now-1h', to: 'now', display: 'Last 1 hour' },
  { from: 'now-3h', to: 'now', display: 'Last 3 hours' },
  { from: 'now-6h', to: 'now', display: 'Last 6 hours'},
  { from: 'now-12h', to: 'now', display: 'Last 12 hours' },
  { from: 'now-24h', to: 'now', display: 'Last 24 hours'},
  { from: 'now-2d', to: 'now', display: 'Last 2 days'},
  { from: 'now-7d', to: 'now', display: 'Last 7 days'},
  { from: 'now-30d', to: 'now', display: 'Last 30 days' },
  { from: 'now-90d', to: 'now', display: 'Last 90 days'},
  { from: 'now-6M', to: 'now', display: 'Last 6 months'},
  { from: 'now-1y', to: 'now', display: 'Last 1 year'},
  { from: 'now-2y', to: 'now', display: 'Last 2 years'},
  { from: 'now-5y', to: 'now', display: 'Last 5 years'},
];

const otherOptions: TimeOption[] = [
  { from: 'now-1d/d', to: 'now-1d/d', display: 'Yesterday' },
  { from: 'now-2d/d', to: 'now-2d/d', display: 'Day before yesterday' },
  { from: 'now-7d/d', to: 'now-7d/d', display: 'This day last week' },
  { from: 'now-1w/w', to: 'now-1w/w', display: 'Previous week'},
  { from: 'now-1M/M', to: 'now-1M/M', display: 'Previous month' },
  { from: 'now-1y/y', to: 'now-1y/y', display: 'Previous year' },
  { from: 'now/d', to: 'now/d', display: 'Today' },
  { from: 'now/d', to: 'now', display: 'Today so far'},
  { from: 'now/w', to: 'now/w', display: 'This week' },
  { from: 'now/w', to: 'now', display: 'This week so far' },
  { from: 'now/M', to: 'now/M', display: 'This month' },
  { from: 'now/M', to: 'now', display: 'This month so far' },
  { from: 'now/y', to: 'now/y', display: 'This year' },
  { from: 'now/y', to: 'now', display: 'This year so far' },
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
              <LeftOutlined translate />
            </Button>
          )}
          <div>
            <Tooltip title={<TimePickerTooltip timeRange={value} timeZone={timeZone} />} placement="bottom">
              <Button aria-label="TimePicker Open Button" onClick={this.onOpen}>
                <ClockCircleOutlined translate className={cx(styles.clockIcon, timePickerIconClass)} />
                <TimePickerButtonLabel {...this.props} />
                <span className={styles.caretIcon}>{isOpen ? <UpOutlined translate /> : <DownOutlined translate />}</span>
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
              <RightOutlined translate />
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
      {/* <div className="text-center">
        <span className={styles.utc}>{timeZoneFormatUserFriendly(timeZone)}</span>
      </div> */}
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
      <span className={styles.utc}>{rangeUtil.describeTimeRange(value, timeZone)}</span>
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
