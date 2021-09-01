import React, { FC } from 'react';
import { useStyles } from 'src/packages/datav-core/src/ui';
import { GrafanaTheme } from 'src/packages/datav-core/src';
import { css } from '@emotion/css';

const getStyles = (theme: GrafanaTheme) => css`
  margin: 0;
  margin-left: ${theme.spacing.md};
  font-size: ${theme.typography.size.sm};
  color: ${theme.colors.textWeak};
`;

export const DetailText: FC = ({ children }) => {
  const collapsedTextStyles = useStyles(getStyles);
  return <p className={collapsedTextStyles}>{children}</p>;
};
