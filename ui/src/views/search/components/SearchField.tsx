import React, { FC, useContext } from 'react';
import { css, cx } from 'emotion';
import { ThemeContext,DatavTheme } from 'src/packages/datav-core/src';
import { DashboardQuery } from '../types';
import { getState } from 'src/store/store';
import localeData from 'src/core/library/locale'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  query: DashboardQuery;
  onChange: (query: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  clearable?: boolean;
  width?: number;
}

const getSearchFieldStyles = (theme: DatavTheme) => ({
  wrapper: css`
    width: 100%;
    display: flex;
    position: relative;
    align-items: center;
  `,
  input: css`
    border: none;
    box-sizing: border-box;
    outline: none;
    background-color: transparent;
    background: transparent;
    border-bottom: 1px solid ${theme.colors.border1};
    font-size: 20px;
    line-height: 38px;
    width: 100%;

    &::placeholder {
      color: ${theme.colors.textWeak};
    }
  `,
  spacer: css`
    flex-grow: 1;
  `,
  icon: cx(
    css`
      color: ${theme.colors.textWeak};
      padding: 0 ${theme.spacing.md};
    `
  ),
  clearButton: css`
    font-size: ${theme.typography.size.sm};
    color: ${theme.colors.textWeak};
    text-decoration: underline;

    &:hover {
      cursor: pointer;
      color: ${theme.colors.textStrong};
    }
  `,
});

export const SearchField: FC<SearchFieldProps> = ({ query, onChange, size, clearable, className, ...inputProps }) => {
  const theme = useContext(ThemeContext);
  const styles = getSearchFieldStyles(theme);

  return (
    <div className={cx(styles.wrapper, className)}>
      <input
        type="text"
        placeholder={localeData[getState().application.locale]['folder.searchPlaceholder']}
        value={query.query}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          onChange(event.currentTarget.value);
        }}
        tabIndex={1}
        spellCheck={false}
        className={styles.input}
        {...inputProps}
      />

      <div className={styles.spacer} />
    </div>
  );
};
