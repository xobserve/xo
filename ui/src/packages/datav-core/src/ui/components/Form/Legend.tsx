import React, { ReactNode } from 'react';
import { useTheme, stylesFactory } from '../../themes';
import { DatavTheme } from '../../../data';
import { css, cx } from 'emotion';

export interface LabelProps extends React.HTMLAttributes<HTMLLegendElement> {
  children: string | ReactNode;
  description?: string;
}

export const getLegendStyles = stylesFactory((theme: DatavTheme) => {
  return {
    legend: css`
      font-size: ${theme.typography.heading.h3};
      font-weight: ${theme.typography.weight.regular};
      margin: 0 0 ${theme.spacing.md} 0;
    `,
  };
});

export const Legend: React.FC<LabelProps> = ({ children, className, ...legendProps }) => {
  const theme = useTheme();
  const styles = getLegendStyles(theme);

  return (
    <legend className={cx(styles.legend, className)} {...legendProps}>
      {children}
    </legend>
  );
};
