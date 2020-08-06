import React, { FC } from 'react';
import { cx, css } from 'emotion';
import { Icon } from '../Icon/Icon';
import { Spin } from 'antd';

const getStyles = (size: number, inline: boolean) => {
  return {
    wrapper: css`
      font-size: ${size}px;
      ${inline
        ? css`
            display: inline-block;
          `
        : ''}
    `,
  };
};

type Props = {
  className?: string;
  style?: React.CSSProperties;
  iconClassName?: string;
  inline?: boolean;
  size?: number;
};
export const Spinner: FC<Props> = (props: Props) => {
  const { className, inline = false, iconClassName, style, size = 16 } = props;
  const styles = getStyles(size, inline);
  return (
    <div style={style} className={cx(styles.wrapper, className)}>
      <Spin size="large" />
    </div>
  );
};
