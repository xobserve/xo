import React, { ReactNode } from 'react';
import { css } from 'emotion';
import { TimeOption, TimeZone,TimeRange ,stylesFactory} from 'src/packages/datav-core';
import { TimePickerTitle } from './TimePickerTitle';
import { TimeRangeOption } from './TimeRangeOption';
import { mapOptionToTimeRange } from './mapper';


const getOptionsStyles = stylesFactory(() => {
  return {
    grow: css`
      flex-grow: 1;
      align-items: flex-start;
    `,
  };
});

interface Props {
  title?: any;
  options: TimeOption[];
  value?: TimeRange;
  onSelect: (option: TimeRange) => void;
  placeholderEmpty?: ReactNode;
  timeZone?: TimeZone;
}

export const TimeRangeList: React.FC<Props> = props => {
  const { title, options, placeholderEmpty } = props;

  if (typeof placeholderEmpty !== 'undefined' && options.length <= 0) {
    return <>{placeholderEmpty}</>;
  }

  if (!title) {
    return <Options {...props} />;
  }

  return (
    <>
      <TimePickerTitle>{title}</TimePickerTitle>
      <Options {...props} />
    </>
  );
};

const Options: React.FC<Props> = ({ options, value, onSelect, timeZone }) => {
  const styles = getOptionsStyles();

  return (
    <>
      <div>
        {options.map((option, index) => (
          <TimeRangeOption
            key={keyForOption(option, index)}
            value={option}
            selected={isEqual(option, value)}
            onSelect={option => onSelect(mapOptionToTimeRange(option, timeZone))}
          />
        ))}
      </div>
      <div className={styles.grow}></div>
    </>
  );
};

function keyForOption(option: TimeOption, index: number): string {
  return `${option.from}-${option.to}-${index}`;
}

function isEqual(x: TimeOption, y?: TimeRange): boolean {
  if (!y || !x) {
    return false;
  }
  return y.raw.from === x.from && y.raw.to === x.to;
}
