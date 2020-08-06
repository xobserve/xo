import React from 'react';

// @ts-ignore
import Highlighter from 'react-highlight-words';
import { CompletionItem, CompletionItemKind } from '../../types/completion';
import classNames from 'classnames'

interface Props {
  isSelected: boolean;
  item: CompletionItem;
  style: any;
  prefix?: string;

  onClickItem?: (event: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const TypeaheadItem: React.FC<Props> = (props: Props) => {
  const { isSelected, item, prefix, style, onMouseEnter, onMouseLeave, onClickItem } = props;
  const classes = classNames({
    'type-ahead-item' : true,
    'type-ahead-item-selected': isSelected
  })

  const label = item.label || '';

  if (item.kind === CompletionItemKind.GroupTitle) {
    return (
      <li className={'type-ahead-item-group-title'} style={style}>
        <span>{label}</span>
      </li>
    );
  }

  return (
    <li
      className={classes}
      style={style}
      onMouseDown={onClickItem}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Highlighter textToHighlight={label} searchWords={[prefix]} highlightClassName={'type-ahead-highlight'} />
    </li>
  );
};
