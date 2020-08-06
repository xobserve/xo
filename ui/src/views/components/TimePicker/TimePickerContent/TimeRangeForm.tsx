import React, { FormEvent, useState, useCallback } from 'react';
import {
  TimeZone,
  isDateTime,
  TimeRange,
  DateTime,
  dateMath,
  dateTimeFormat,
  dateTimeParse,
  rangeUtil,
  RawTimeRange,
  FormField
} from 'src/packages/datav-core';

import { TimePickerCalendar } from './TimePickerCalendar';
import { Button,Input } from 'antd';
import { FormattedMessage } from 'react-intl';
// import { Field } from 'src/packages/datav-core/src/ui/components/Form/Field';

interface Props {
  isFullscreen: boolean;
  value: TimeRange;
  onApply: (range: TimeRange) => void;
  timeZone?: TimeZone;
  roundup?: boolean;
}

interface InputState {
  value: string;
  invalid: boolean;
}

const errorMessage = 'Please enter a past date or "now"';

export const TimeRangeForm: React.FC<Props> = props => {
  const { value, isFullscreen = false, timeZone } = props;

  const [from, setFrom] = useState<InputState>(valueToState(value.raw.from, false, timeZone));
  const [to, setTo] = useState<InputState>(valueToState(value.raw.to, true, timeZone));
  const [isOpen, setOpen] = useState(false);

  const onOpen = useCallback(
    (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setOpen(true);
    },
    [setOpen]
  );

  const onFocus = useCallback(
    (event: FormEvent<HTMLElement>) => {
      if (!isFullscreen) {
        return;
      }
      onOpen(event);
    },
    [isFullscreen, onOpen]
  );

  const onApply = useCallback(() => {
    if (to.invalid || from.invalid) {
      return;
    }

    const raw: RawTimeRange = { from: from.value, to: to.value };
    const timeRange = rangeUtil.convertRawToRange(raw, timeZone);

    props.onApply(timeRange);
  }, [from, to, timeZone,props]);

  const onChange = useCallback(
    (from: DateTime, to: DateTime) => {
      setFrom(valueToState(from, false, timeZone));
      setTo(valueToState(to, true, timeZone));
    },
    [timeZone]
  );


  return (
    <>
      <FormField label="From"  error={errorMessage}>
        <Input
          onClick={event => event.stopPropagation()}
          onFocus={onFocus}
          onChange={event => setFrom(eventToState(event, false, timeZone))}
          value={from.value}
        />
      </FormField>
      <FormField label="To"  error={errorMessage}>
        <Input
          onClick={event => event.stopPropagation()}
          onFocus={onFocus}
          onChange={event => setTo(eventToState(event, true, timeZone))}
          value={to.value}
        />
      </FormField>
      <Button  type="primary" onClick={onApply}><FormattedMessage id="dashboard.applyTimeRange"/></Button>

      <TimePickerCalendar
        isFullscreen={isFullscreen}
        isOpen={isOpen}
        from={dateTimeParse(from.value, { timeZone })}
        to={dateTimeParse(to.value, { timeZone })}
        onApply={onApply}
        onClose={() => setOpen(false)}
        onChange={onChange}
        timeZone={timeZone}
      />
    </>
  );
};

function eventToState(event: FormEvent<HTMLInputElement>, roundup?: boolean, timeZone?: TimeZone): InputState {
  return valueToState(event.currentTarget.value, roundup, timeZone);
}

function valueToState(raw: DateTime | string, roundup?: boolean, timeZone?: TimeZone): InputState {
  const value = valueAsString(raw, timeZone);
  const invalid = !isValid(value, roundup, timeZone);
  return { value, invalid };
}

function valueAsString(value: DateTime | string, timeZone?: TimeZone): string {
  if (isDateTime(value)) {
    return dateTimeFormat(value, { timeZone });
  }
  return value;
}

function isValid(value: string, roundUp?: boolean, timeZone?: TimeZone): boolean {
  if (isDateTime(value)) {
    return value.isValid();
  }

  if (dateMath.isMathString(value)) {
    return dateMath.isValid(value);
  }

  const parsed = dateTimeParse(value, { roundUp, timeZone });
  return parsed.isValid();
}
