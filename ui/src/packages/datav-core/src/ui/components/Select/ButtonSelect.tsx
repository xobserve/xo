import React from 'react';

// import { Button, ButtonVariant, ButtonProps } from '../Button';
import {Button} from 'antd'
import { ComponentSize } from '../../types';
import { SelectCommonProps, CustomControlProps } from './types';
import { SelectBase } from './SelectBase';
import { Icon } from '../Icon/Icon';

interface ButtonSelectProps<T> extends Omit<SelectCommonProps<T>, 'renderControl' | 'size' | 'prefix'> {
  icon?: any;
  size?: ComponentSize;
}



const SelectButton = React.forwardRef<HTMLButtonElement, any>(
  ({ icon, children, isOpen, ...buttonProps }, ref) => {

    return (
      <Button {...buttonProps} ref={ref} icon={icon}>
        <span className={'datav-button-select-wrapper'}>
          <span>{children}</span>
          <span className={'caretWrap'}>
            <Icon name={isOpen ? 'angle-up' : 'angle-down'} />
          </span>
        </span>
      </Button>
    );
  }
);

export function ButtonSelect<T>({
  placeholder,
  icon,
  size = 'md',
  className,
  disabled,
  ...selectProps
}: ButtonSelectProps<T>) {
  const buttonProps = {
    icon,
    size,
    className,
    disabled,
  };

  return (
    <SelectBase
      {...selectProps}
      renderControl={React.forwardRef<any, CustomControlProps<T>>(({ onBlur, onClick, value, isOpen }, ref) => {
        return (
          <SelectButton {...buttonProps} ref={ref} onBlur={onBlur} onClick={onClick} isOpen={isOpen}>
            {value ? value.label : placeholder}
          </SelectButton>
        );
      })}
    />
  );
}
