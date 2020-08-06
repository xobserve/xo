import React from 'react';
import { cx } from 'emotion';
import './_AbstractList.less'

export interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  getItemKey?: (item: T) => string;
  className?: string;
}

interface AbstractListProps<T> extends ListProps<T> {
  inline?: boolean;
}

export class AbstractList<T> extends React.PureComponent<AbstractListProps<T>> {
  render() {
    const { items, renderItem, getItemKey, className, inline } = this.props;

    return (
      <ul className={cx('datav-list', className)}>
        {items.map((item, i) => {
          return (
            <li className={'datav-list-item'} key={getItemKey ? getItemKey(item) : i} style={{display: (inline && 'inline-block') || 'block'}}>
              {renderItem(item, i)}
            </li>
          );
        })}
      </ul>
    );
  }
}
