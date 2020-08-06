import React, { FC } from 'react';
import {cx,css} from 'emotion'
import {stylesFactory, useTheme} from '../../themes'
import { DatavTheme } from '../../../data';
export interface EmptySearchProps {
  children: JSX.Element | string;
}

const EmptySearchResult: FC<EmptySearchProps> = ({ children }) => {
    const theme = useTheme()
    const styles = getButtonStyles(theme)
  return <div className={cx(styles.emptySearchResult,"empty-search-result")}>{children}</div>;
};

export { EmptySearchResult };



export const getButtonStyles = stylesFactory((theme:DatavTheme) => {
    return {
        emptySearchResult: cx(
            css`
            border-left: 3px solid ${theme.palette.blue80};
            background-color: ${theme.colors.bg2};
            padding: ${theme.spacing.d};
            min-width: 350px;
            border-radius: ${theme.border.radius.md};
            margin-bottom: ${theme.spacing.d} * 2;
            `
        )
    }
  });
  