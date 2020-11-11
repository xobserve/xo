import React, { FC } from 'react';
import { escapeStringForRegex, unEscapeStringFromRegex } from 'src/packages/datav-core/src';
import { Input, Icon } from 'src/packages/datav-core/src';

export interface Props {
  value: string | undefined;
  placeholder?: any;
  labelClassName?: string;
  inputClassName?: string;
  onChange: (value: string) => void;
}

export const FilterInput: FC<Props> = props => (
  <Input
    // Replaces the usage of ref
    prefix={<Icon name="search" />}
    width={40}
    type="text"
    value={props.value ? unEscapeStringFromRegex(props.value) : ''}
    onChange={event => props.onChange(escapeStringForRegex(event.currentTarget.value))}
    placeholder={props.placeholder ?? ''}
  />
);
