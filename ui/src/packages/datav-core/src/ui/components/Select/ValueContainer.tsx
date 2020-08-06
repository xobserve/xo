import React, { ReactNode } from 'react';
import { cx } from 'emotion';

class UnthemedValueContainer extends React.Component<any> {
  render() {
    const { children } = this.props;
    const { selectProps } = this.props;

    if (
      selectProps &&
      Array.isArray(children) &&
      Array.isArray(children[0]) &&
      selectProps.maxVisibleValues !== undefined &&
      !(selectProps.showAllSelectedWhenOpen && selectProps.menuIsOpen)
    ) {
      const [valueChildren, ...otherChildren] = children;
      const truncatedValues = valueChildren.slice(0, selectProps.maxVisibleValues);

      return this.renderContainer([truncatedValues, ...otherChildren]);
    }

    return this.renderContainer(children);
  }

  renderContainer(children?: ReactNode) {
    const { isMulti } = this.props;
 
    const className = cx('select-value-container', isMulti && 'select-multi-value-container');
    return <div className={className}>{children}</div>;
  }
}

export const ValueContainer = UnthemedValueContainer;
