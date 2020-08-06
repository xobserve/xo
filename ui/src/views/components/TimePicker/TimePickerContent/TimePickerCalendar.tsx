import React, { memo, useState, useEffect, useCallback } from 'react';
import { css } from 'emotion';
import Calendar from 'react-calendar/dist/entry.nostyle';
import { DateTime, TimeZone, dateTimeParse,stylesFactory,ClickOutsideWrapper} from 'src/packages/datav-core';
import { TimePickerTitle } from './TimePickerTitle';
import { Button } from 'antd';
import { ClockCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

const getStyles = stylesFactory(() => {
  return {
    container: css`
    top: 0;
    position: absolute;
    right: 546px;
    box-shadow: 0px 0px 20px #000000;
    background-color: #141619;
    z-index: -1;

    &:after {
      display: block;
      background-color: #141619;
      width: 19px;
      height: 381px;
      content: ' ';
      position: absolute;
      top: 0;
      right: -19px;
      border-left: 1px solid #202226;
    }
  `,
  modal: css`
    position: fixed;
    top: 20%;
    width: 100%;
    z-index: 1060;
  `,
  content: css`
    margin: 0 auto;
    width: 268px;
  `,
  backdrop: css`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #202226;
    opacity: 0.7;
    z-index: 1050;
    text-align: center;
  `,
    
  };
});

// {border: "#202226", background: "#141619", shadow: "#000000", formBackground: "#202226"}

const getFooterStyles = stylesFactory(() => {
  return {
    container: css`
      background-color: #141619;
      display: flex;
      justify-content: center;
      padding: 10px;
      align-items: stretch;
    `,
    apply: css`
      margin-right: 4px;
      width: 100%;
      justify-content: center;
    `,
  };
});

const getBodyStyles = stylesFactory(() => {
  return {
    title: css`
      color: #c7d0d9;
      background-color: #141619;
      font-size: 14px;
      border: 1px solid transparent;

      &:hover {
        position: relative;
      }
    `,
    body: css`
      z-index: 1060;
      background-color: #141619;
      width: 268px;

      abbr {
        margin-top: -15px !important;
        height: 26px;
        display: block;
      }

      .react-calendar__navigation__label,
      .react-calendar__navigation__arrow,
      .react-calendar__navigation {
        padding-top: 4px;
        background-color: inherit;
        color: #c7d0d9;
        border: 0;
        font-weight: 500;
      }

      .react-calendar__month-view__weekdays {
        background-color: inherit;
        text-align: center;
        color: #1f60c4;

        abbr {
          border: 0;
          text-decoration: none;
          cursor: default;
          display: block;
          padding: 4px 0 4px 0;
          margin-bottom: 15px !important;
        }
      }

      .react-calendar__month-view__days {
        background-color: inherit;
      }

      .react-calendar__tile,
      .react-calendar__tile--now {
        margin-bottom: 4px;
        background-color: inherit;
        height: 40px !important;
      }

      .react-calendar__navigation__label,
      .react-calendar__navigation > button:focus,
      .time-picker-calendar-tile:focus {
        outline: 0;
      }

      .react-calendar__tile--active,
      .react-calendar__tile--active:hover {
        color: #fff;
        font-weight: 500;
        background: #5794f2;
        box-shadow: none;
        border: 0px;
      }

      .react-calendar__tile--rangeEnd,
      .react-calendar__tile--rangeStart {
        padding: 0;
        border: 0px;
        color: ;
        font-weight: 500;
        background: #1f60c4;

        abbr {
          border-radius: 100px;
          display: block;
          margin-top: -15px !important;
          height: 26px;
        }
      }

      .react-calendar__tile--rangeStart {
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
      }

      .react-calendar__tile--rangeEnd {
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
      }
    `,
  };
});

const getHeaderStyles = stylesFactory(() => {
  return {
    container: css`
      background-color: #141619;
      display: flex;
      justify-content: space-between;
      padding: 7px;
    `,
  };
});

interface Props {
  isOpen: boolean;
  from: DateTime;
  to: DateTime;
  onClose: () => void;
  onApply: () => void;
  onChange: (from: DateTime, to: DateTime) => void;
  isFullscreen: boolean;
  timeZone?: TimeZone;
}

const stopPropagation = (event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation();

export const TimePickerCalendar = memo<Props>(props => {
  const styles = getStyles();
  const { isOpen, isFullscreen } = props;
  
  if (!isOpen) {
    return null;
  }

  if (isFullscreen) {
    return (
      <ClickOutsideWrapper onClick={props.onClose}>
        <div className={styles.container} onClick={stopPropagation}>
          <Body {...props} />
        </div>
      </ClickOutsideWrapper>
    );
  }

  return (
    <>
      <div className={styles.modal} onClick={stopPropagation}>
        <div className={styles.content}>
          <Header {...props} />
          <Body {...props} />
          <Footer {...props} />
        </div>
      </div>
      <div className={styles.backdrop} onClick={stopPropagation} />
    </>
  );
});

const Header = memo<Props>(({ onClose }) => {
  const styles = getHeaderStyles();

  return (
    <div className={styles.container}>
      <TimePickerTitle>Select a time range</TimePickerTitle>
      <ClockCircleOutlined onClick={onClose} />
    </div>
  );
});

const Body = memo<Props>(({ onChange, from, to, timeZone }) => {
  const [value, setValue] = useState<Date[]>();
  const onCalendarChange = useOnCalendarChange(onChange, timeZone);
  const styles = getBodyStyles();

  useEffect(() => {
    setValue(inputToValue(from, to));
  }, [from,to]);

  return (
    <Calendar
      selectRange={true}
      next2Label={null}
      prev2Label={null}
      className={styles.body}
      tileClassName={styles.title}
      value={value}
      nextLabel={<RightOutlined />}
      prevLabel={<LeftOutlined />}
      onChange={onCalendarChange}
      locale="en"
    />
  );
});

const Footer = memo<Props>(({ onClose, onApply }) => {
  const styles = getFooterStyles();

  return (
    <div className={styles.container}>
      <Button className={styles.apply} onClick={onApply}>
        <FormattedMessage id="dashboard.applyTimeRange" />
      </Button>
      <Button onClick={onClose}>
        Cancel
      </Button>
    </div>
  );
});

function inputToValue(from: DateTime, to: DateTime): Date[] {
  const fromAsDate = from.toDate();
  const toAsDate = to.toDate();

  if (fromAsDate > toAsDate) {
    return [toAsDate, fromAsDate];
  }
  return [fromAsDate, toAsDate];
}

function useOnCalendarChange(onChange: (from: DateTime, to: DateTime) => void, timeZone?: TimeZone) {
  return useCallback(
    (value: Date | Date[]) => {
      if (!Array.isArray(value)) {
        return console.error('onCalendarChange: should be run in selectRange={true}');
      }

      const from = dateTimeParse(dateInfo(value[0]), { timeZone });
      const to = dateTimeParse(dateInfo(value[1]), { timeZone });

      onChange(from, to);
    },
    [onChange,timeZone]
  );
}

function dateInfo(date: Date): number[] {
  return [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
}
