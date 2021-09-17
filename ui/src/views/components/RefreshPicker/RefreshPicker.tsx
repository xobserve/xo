import React, { PureComponent } from 'react';
import classNames from 'classnames';
import { css } from 'emotion';
import {Select,Tooltip,Button} from 'antd'

import {ReloadOutlined} from '@ant-design/icons';
import memoizeOne from 'memoize-one';

import './index.less'
import { FormattedMessage as Message} from 'react-intl';

export const defaultIntervals = ['5s', '10s', '30s', '1m', '5m', '15m', '30m', '1h', '2h', '1d'];
const getStyles = memoizeOne(() => {
  return {
    selectButton: css`
      label: selectButton;
      .select-button-value {
        color: #eb7b18;
      }
    `,
  };
});

export interface Props {
  intervals?: string[];
  onRefresh?: () => any;
  onIntervalChanged: (interval: string) => void;
  value?: string;
  hasLiveOption?: boolean;
  // You can supply your own refresh button element. In that case onRefresh and tooltip are ignored.
  refreshButton?: React.ReactNode;
  buttonSelectClassName?: string;
}

interface State {
  selectedOption: {label:string,value:string}
}

export class RefreshPickerBase extends PureComponent<Props,State> {
  static offOption = { label: 'Off', value: '' };
  static liveOption = { label: 'Live', value: 'LIVE' };
  static isLive = (refreshInterval?: string): boolean => refreshInterval === RefreshPicker.liveOption.value;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedOption: {label:'Off',value : props.value}
    }
  }

  
  intervalsToOptions = (intervals: string[] | undefined) => {
    const intervalsOrDefault = intervals || defaultIntervals;
    const options = intervalsOrDefault.map(interval => ({ label: interval, value: interval }));

    if (this.props.hasLiveOption) {
      options.unshift(RefreshPicker.liveOption);
    }

    options.unshift(RefreshPicker.offOption);
    return options;
  };

  onChangeSelect = (interval:string,option) => {
    this.setState({selectedOption:option})
    const { onIntervalChanged } = this.props;
    if (onIntervalChanged) {
      onIntervalChanged(interval);
    }
  };

  render() {
    const { onRefresh, intervals, refreshButton, buttonSelectClassName } = this.props;
    const {selectedOption} = this.state

    const options = this.intervalsToOptions(intervals);

    const styles = getStyles();

    const cssClasses = classNames({
      'refresh-picker': true,
      'refresh-picker--off': selectedOption.label === RefreshPicker.offOption.label,
      'refresh-picker--live': selectedOption === RefreshPicker.liveOption,
    });

    return (
      <div className={cssClasses}>
        <div className="refresh-picker-buttons">
          {refreshButton ? (
            refreshButton
          ) : (
            <Tooltip placement="bottom" title={<Message id='dashboard.refresh'/>}>
              <Button
                onClick={onRefresh!}
              >
                <ReloadOutlined translate="true" />
              </Button>
            </Tooltip>
          )}
          <Select
            className={classNames('navbar-button--attached', styles.selectButton, buttonSelectClassName)}
            value={selectedOption.value}
            options={options}
            onChange={this.onChangeSelect}
          />
        </div>
      </div>
    );
  }
}

export const RefreshPicker = RefreshPickerBase;
