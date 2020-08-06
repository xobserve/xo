import React from 'react';
import { Icon } from '../Icon/Icon';

interface MultiValueContainerProps {
  innerProps: any;
}

export const MultiValueContainer: React.FC<MultiValueContainerProps> = ({ innerProps, children }) => {
  return (
    <div {...innerProps} className={'select-multi-value-container'}>
      {children}
    </div>
  );
};

export type MultiValueRemoveProps = {
  innerProps: any;
};

export const MultiValueRemove: React.FC<MultiValueRemoveProps> = ({ children, innerProps }) => {
  return (
    <div {...innerProps} className={'select-multi-value-remove'}>
      <Icon name="times" size="sm" />
    </div>
  );
};
