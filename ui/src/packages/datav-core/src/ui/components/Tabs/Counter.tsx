import React, { FC } from 'react';
import { css } from 'emotion';
import { stylesFactory, useTheme } from '../../themes';
import { DatavTheme, locale } from '../../../data';

const getStyles = stylesFactory((theme: DatavTheme) => {
  return {
    counter: css`
      label: counter;
      margin-left: ${theme.spacing.sm};
      border-radius: ${theme.spacing.lg};
      background-color: ${theme.colors.bg2};
      padding: ${theme.spacing.xxs} ${theme.spacing.sm};
      color: ${theme.colors.textWeak};
      font-weight: ${theme.typography.weight.semibold};
      font-size: ${theme.typography.size.sm};
    `,
  };
});

export interface CounterProps {
  value: number;
}

export const Counter: FC<CounterProps> = ({ value }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return <span className={styles.counter}>{locale(value, 0).text}</span>;
};
