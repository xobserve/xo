import React, { FC, useCallback, CSSProperties } from 'react';
import { css, cx } from 'emotion';
import { DatavTheme } from 'src/packages/datav-core';
import { useTheme, TagList, styleMixins, stylesFactory } from 'src/packages/datav-core';
import { DashboardSectionItem, OnToggleChecked } from '../types';
import { SearchCheckbox } from './SearchCheckbox';
import { SEARCH_ITEM_HEIGHT, SEARCH_ITEM_MARGIN } from '../constants';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';

export interface Props {
  item: DashboardSectionItem;
  editable?: boolean;
  onTagSelected: (name: string) => any;
  onToggleChecked?: OnToggleChecked;
  style?: CSSProperties;
}



export const SearchItem: FC<Props> = ({ item, editable, onToggleChecked, onTagSelected, style }) => {
  const theme = useTheme();
  const styles = getResultsItemStyles(theme);

  const tagSelected = useCallback((tag: string, event: React.MouseEvent<HTMLElement>) => {
    onTagSelected(tag);
  }, []);

  const toggleItem = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (onToggleChecked) {
        onToggleChecked(item);
      }
    },
    [item]
  );

  return (
    <div
      style={style}
      className={cx(styles.wrapper, { [styles.selected]: item.selected })}
    >
      <SearchCheckbox editable={editable} checked={item.checked} onClick={toggleItem} />

      <Tooltip title={`dashboard uid : ${item.uid}`} placement="topLeft">
      <Link to={item.url} className={styles.link}>
        <div className={styles.body}>
          <span>{item.title}</span>
          <span className={styles.folderTitle}>{item.folderTitle}</span>
        </div>
      </Link>
      </Tooltip>
      <TagList tags={item.tags} onClick={tagSelected} className={styles.tags} />
    </div>
  );
};

const getResultsItemStyles = stylesFactory((theme: DatavTheme) => ({
  wrapper: css`
    ${styleMixins.listItem(theme)};
    label: search-item;
    display: flex;
    align-items: center;
    height: ${SEARCH_ITEM_HEIGHT}px;
    margin-bottom: ${SEARCH_ITEM_MARGIN}px;
    padding: 0 ${theme.spacing.md};

    &:last-child {
      margin-bottom: ${SEARCH_ITEM_MARGIN * 2}px;
    }

    :hover {
      cursor: pointer;
    }
  `,
  selected: css`
    ${styleMixins.listItemSelected(theme)};
  `,
  body: css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1 1 auto;
    overflow: hidden;
  `,
  folderTitle: css`
    color: ${theme.colors.textWeak};
    font-size: ${theme.typography.size.xs};
    line-height: ${theme.typography.lineHeight.xs};
    position: relative;
    top: -1px;
  `,
  icon: css`
    margin-left: 10px;
  `,
  tags: css`
    flex-grow: 0;
    justify-content: flex-end;
    @media only screen and (max-width: ${theme.breakpoints.md}) {
      display: none;
    }
  `,
  link: css`
    display: flex;
    align-items: center;
    flex-shrink: 0;
    flex-grow: 1;
    height: 100%;
  `,
}));
