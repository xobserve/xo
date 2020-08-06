import React from 'react';
import { cx } from 'emotion';
import { SelectableValue } from '../../..';
import { Icon } from '../Icon/Icon';
import { CustomScrollbar } from '../CustomScrollbar';
import classNames from 'classnames'

interface SelectMenuProps {
  maxHeight: number;
  innerRef: React.Ref<any>;
  innerProps: {};
}

export const SelectMenu = React.forwardRef<HTMLDivElement, React.PropsWithChildren<SelectMenuProps>>((props, ref) => {
  const { children, maxHeight, innerRef, innerProps } = props;

  return (
    <div {...innerProps} className={'datav-select-menu '} ref={innerRef} style={{ maxHeight }} aria-label="Select options menu">
      <CustomScrollbar autoHide={false} autoHeightMax="inherit" hideHorizontalTrack>
        {children}
      </CustomScrollbar>
    </div>
  );
});

SelectMenu.displayName = 'SelectMenu';

interface SelectMenuOptionProps<T> {
  isDisabled: boolean;
  isFocused: boolean;
  isSelected: boolean;
  innerProps: any;
  renderOptionLabel?: (value: SelectableValue<T>) => JSX.Element;
  data: SelectableValue<T>; 
}

export const SelectMenuOptions = React.forwardRef<HTMLDivElement, React.PropsWithChildren<SelectMenuOptionProps<any>>>(
  (props, ref) => {
    const { children, innerProps, data, renderOptionLabel, isSelected, isFocused } = props;

    // .datav-select-menu-option-focused
    const classes = classNames({
      'datav-select-menu-option' : true,
      'datav-select-menu-option-focused':isFocused
    })
    return (
      <div
        ref={ref}
        className={classes}
        {...innerProps}
        aria-label="Select option"
      >
        {data.imgUrl && <img className={'datav-select-menu-option-image'} src={data.imgUrl} />}
        <div className={'datav-select-menu-option-body'}>
          <span>{renderOptionLabel ? renderOptionLabel(data) : children}</span>
          {data.description && <div className={'datav-select-menu-option-desc'}>{data.description}</div>}
        </div>
        {isSelected && (
          <span>
            <Icon name="check" />
          </span>
        )}
      </div>
    );
  }
);
