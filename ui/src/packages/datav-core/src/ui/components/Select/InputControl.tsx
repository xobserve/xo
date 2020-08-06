import React from 'react';
import classNames from 'classnames'

interface InputControlProps {
  /** Show an icon as a prefix in the input */
  prefix?: JSX.Element | string | null;
  focused: boolean;
  invalid: boolean;
  disabled: boolean;
  innerProps: any;
}


export const InputControl = React.forwardRef<HTMLDivElement, React.PropsWithChildren<InputControlProps>>(
  function InputControl({ focused, invalid, disabled, children, innerProps, prefix, ...otherProps }, ref) {
    const classes = classNames({
      'input-control-wrapper': true,
      'input-control-wrapper-focused' : focused,
      'input-control-wrapper-disabled' : disabled,
      'input-control-wrapper-withPrefix' : prefix,
    })
    return (
      <div className={classes} {...innerProps} ref={ref}>
        {prefix && <div className={'prefix'}>{prefix}</div>}
        {children}
      </div>
    );
  }
);
