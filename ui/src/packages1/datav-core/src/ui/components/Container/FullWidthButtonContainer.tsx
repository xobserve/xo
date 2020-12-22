import React, { FC } from 'react';
import { cx } from 'emotion';
import './FullWidthButtonContainer.less'

export interface Props {
  className?: string;
}

export const FullWidthButtonContainer: FC<Props> = ({ className, children }) => {

  return <div className={cx('full-width-button-container', className)}>{children}</div>;
};

