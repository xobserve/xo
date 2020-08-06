import { isDateTime, TimeOption, TimeRange, TimeZone,stylesFactory,CustomScrollbar} from 'src/packages/datav-core';
import { css } from 'emotion';
import React, {useState } from 'react';
import { useMedia } from 'react-use';
import {UpOutlined,DownOutlined} from '@ant-design/icons';
import { mapRangeToTimeOption } from './mapper';
import { TimePickerTitle } from './TimePickerTitle';
import { TimeRangeForm } from './TimeRangeForm';
import { TimeRangeList } from './TimeRangeList';
import { FormattedMessage  as Message} from 'react-intl';

const getStyles = stylesFactory(() => {
  return {
    container: css`
      color: rgba(255, 255, 255, 0.65);
      display: flex;
      background: #141619;
      box-shadow: 0px 0px 20px #000000;
      position: absolute;
      z-index: 1060;
      width: 546px;
      height: 381px;
      top: 116%;
      margin-left: -322px;

      @media only screen and (max-width: 992px) {
        width: 218px;
        margin-left: 6px;
      }

      @media only screen and (max-width: 544px) {
        width: 264px;
        margin-left: -100px;
      }
    `,
    leftSide: css`
      display: flex;
      flex-direction: column;
      border-right: 1px solid #202226;
      width: 60%;
      overflow: hidden;

      @media only screen and (max-width: 992px) {
        display: none;
      }
    `,
    rightSide: css`
      width: 40% !important;

      @media only screen and (max-width: 992px) {
        width: 100% !important;
      }
    `,
    spacing: css`
      margin-top: 16px;
    `,
  };
});

const getNarrowScreenStyles = stylesFactory(() => {
  return {
    header: css`
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #202226;
      padding: 7px 9px 7px 9px;
    `,
    body: css`
      border-bottom: 1px solid #202226;
      background: #202226;
      box-shadow: inset 0px 2px 2px #000000;
    `,
    form: css`
      padding: 7px 9px 7px 9px;
    `,
  };
});

const getFullScreenStyles = stylesFactory(() => {
  return {
    container: css`
      padding-top: 9px;
      padding-left: 11px;
      padding-right: 20%;
    `,
    title: css`
      margin-bottom: 11px;
    `,
    recent: css`
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    `,
  };
});


interface Props {
  value: TimeRange;
  onChange: (timeRange: TimeRange) => void;
  timeZone?: TimeZone;
  quickOptions?: TimeOption[];
  otherOptions?: TimeOption[];
  history?: TimeRange[];
}

interface PropsWithScreenSize extends Props {
  isFullscreen: boolean;
}

interface FormProps extends Omit<Props, 'history'> {
  visible: boolean;
  historyOptions?: TimeOption[];
}

export const TimePickerContentWithScreenSize: React.FC<PropsWithScreenSize> = props => {
  const styles = getStyles();
  const historyOptions = mapToHistoryOptions(props.history, props.timeZone);
  const { quickOptions = [], otherOptions = [], isFullscreen } = props;

  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>
        <FullScreenForm {...props} visible={isFullscreen} historyOptions={historyOptions} />
      </div>
      <CustomScrollbar className={styles.rightSide}>
        <NarrowScreenForm {...props} visible={!isFullscreen} historyOptions={historyOptions} />
        <TimeRangeList
          title={<Message id="dashboard.relativeTimePickerTitle" />}
          options={quickOptions}
          onSelect={props.onChange}
          value={props.value}
          timeZone={props.timeZone}
        />
        <div className={styles.spacing} />
        <TimeRangeList
          title="Other quick ranges"
          options={otherOptions}
          onSelect={props.onChange}
          value={props.value}
          timeZone={props.timeZone}
        />
      </CustomScrollbar>
    </div>
  );
};

export const TimePickerContent: React.FC<Props> = props => {
  const isFullscreen = useMedia(`(min-width: 992px)`);

  return <TimePickerContentWithScreenSize {...props} isFullscreen={isFullscreen} />;
};

const NarrowScreenForm: React.FC<FormProps> = props => {
  const isAbsolute = isDateTime(props.value.raw.from) || isDateTime(props.value.raw.to);
  const [collapsed, setCollapsed] = useState(isAbsolute);

  if (!props.visible) {
    return null;
  }

  const styles = getNarrowScreenStyles();
  
  return (
    <>
      <div className={styles.header} onClick={() => setCollapsed(!collapsed)}>
        <TimePickerTitle><Message id="dashboard.timePickerTitle" /></TimePickerTitle>
        {collapsed ? <UpOutlined />: <DownOutlined />}
      </div>
      {collapsed && (
        <div className={styles.body}>
          <div className={styles.form}>
            <TimeRangeForm
              value={props.value}
              onApply={props.onChange}
              timeZone={props.timeZone}
              isFullscreen={false}
            />
          </div>
        </div>
      )}
    </>
  );
};

const FullScreenForm: React.FC<FormProps> = props => {
  if (!props.visible) {
    return null;
  }
  const styles = getFullScreenStyles();

  return (
    <>
      <div className={styles.container}>
        <div className={styles.title}>
          <TimePickerTitle><Message id="dashboard.absoluteTimePickerTitle" /></TimePickerTitle>
        </div>
        <TimeRangeForm value={props.value} timeZone={props.timeZone} onApply={props.onChange} isFullscreen={true} />
      </div>
    </>
  );
};

function mapToHistoryOptions(ranges?: TimeRange[], timeZone?: TimeZone): TimeOption[] {
  if (!Array.isArray(ranges) || ranges.length === 0) {
    return [];
  }
  return ranges.slice(ranges.length - 4).map(range => mapRangeToTimeOption(range, timeZone));
}
