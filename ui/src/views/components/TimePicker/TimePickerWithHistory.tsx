import React from 'react';
import { Props as TimePickerProps, TimeRangePicker } from './TimeRangePicker';


interface Props extends Omit<TimePickerProps, 'history' | 'theme '> {}

export const TimePickerWithHistory: React.FC<Props> = props => {
  return (
          <TimeRangePicker
            {...props}
            onChange={value => {
              props.onChange(value);
            }}
          />
  );
};

