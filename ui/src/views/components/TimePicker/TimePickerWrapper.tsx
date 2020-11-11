// Libaries
import React, { Component } from 'react';
import { dateMath,TimeRange,config,stylesFactory} from 'src/packages/datav-core/src';
import { css } from 'emotion';



// Utils & Services
import {TimePickerWithHistory} from 'src/views/components/TimePicker/TimePickerWithHistory'
import {getTimeSrv} from 'src/core/services/time'

import { defaultIntervals ,RefreshPicker} from 'src/views/components/RefreshPicker/RefreshPicker';
import { CoreEvents } from 'src/types';
import { appEvents } from 'src/core/library/utils/app_events';

const getStyles = stylesFactory(() => {
  return {
    container: css`
      position: relative;
      display: flex;
    `,
  };
});


class UnthemedDashNavTimeControls extends Component<any> {
  componentDidMount() {
    appEvents.on(CoreEvents.timeRangeUpdated, this.triggerForceUpdate);
  }

  componentWillUnmount() {
    appEvents.off(CoreEvents.timeRangeUpdated, this.triggerForceUpdate);
  }

  triggerForceUpdate = () => {
    this.forceUpdate();
  };

  get refreshParamInUrl(): string {
    return '1m'
    // return this.props.location.query.refresh as string;
  }

  onChangeRefreshInterval = (interval: string) => {
    getTimeSrv().setAutoRefresh(interval);
  };

  onRefresh = () => {
    getTimeSrv().notifyTimeUpdate(getTimeSrv().timeRange());
    return Promise.resolve();
  };

  onMoveBack = () => {
    // appEvents.emit(CoreEvents.shiftTime, -1);
  };

  onMoveForward = () => {
    // appEvents.emit(CoreEvents.shiftTime, 1);
  };

  onChangeTimePicker = (timeRange: TimeRange) => {
    const adjustedFrom = dateMath.isMathString(timeRange.raw.from) ? timeRange.raw.from : timeRange.from;
    const adjustedTo = dateMath.isMathString(timeRange.raw.to) ? timeRange.raw.to : timeRange.to;
    const nextRange = {
      from: adjustedFrom,
      to:  adjustedTo,
    };

    getTimeSrv().setTime(nextRange,true);
    this.forceUpdate()
  };

  onZoom = () => {
    // appEvents.emit(CoreEvents.zoomOut, 2);
  };

  render() {
    const intervals =  defaultIntervals

    const timePickerValue = getTimeSrv().timeRange();
    const timeZone = config.timePicker.timezone
    const styles = getStyles();
    const refresh = getTimeSrv().refresh
    return (
      <div className={styles.container}>
        <TimePickerWithHistory
          value={timePickerValue}
          onChange={this.onChangeTimePicker}
          timeZone={timeZone}
          onMoveBackward={this.onMoveBack}
          onMoveForward={this.onMoveForward}
          onZoom={this.onZoom}
        />
        <RefreshPicker
          onIntervalChanged={this.onChangeRefreshInterval}
          onRefresh={this.onRefresh}
          value={refresh}
          intervals={intervals}
        />
      </div>
    );
  }
}

export const TimePickerWrapper = UnthemedDashNavTimeControls;
