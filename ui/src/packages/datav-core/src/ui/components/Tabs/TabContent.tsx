import React, { FC, HTMLAttributes, ReactNode } from 'react';

import { css, cx } from 'emotion';
import { stylesFactory } from '../../themes';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const getTabContentStyle = stylesFactory(() => {
  return {
    tabContent: css`
      padding: 12px;
    `,
  };
});

export const TabContent: FC<Props> = ({ children, className, ...restProps }) => {
  const styles = getTabContentStyle();

  return (
    <div {...restProps} className={cx(styles.tabContent, className)}>
      {children}
    </div>
  );
};
