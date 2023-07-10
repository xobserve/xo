// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from 'react';
import cx from 'classnames';
import _get from 'lodash/get';

import { TraceSpan } from 'types/plugins/trace';
import spanAncestorIds from '../utils';
import { AiOutlineArrowDown, AiOutlineRight } from 'react-icons/ai';


type TProps = {
  childrenVisible?: boolean;
  onClick?: () => void;
  span: TraceSpan;
  showChildrenIcon?: boolean;
  hoverIndentIds: Set<string>;
  addHoverIndentId: (spanID: string) => void;
  removeHoverIndentId: (spanID: string) => void;
};

export default class SpanTreeOffset extends React.PureComponent<TProps> {
  ancestorIds: string[];

  static defaultProps = {
    childrenVisible: false,
    onClick: undefined,
    showChildrenIcon: true,
  };

  constructor(props: TProps) {
    super(props);

    this.ancestorIds = spanAncestorIds(props.span);
    // Some traces have multiple root-level spans, this connects them all under one guideline and adds the
    // necessary padding for the collapse icon on root-level spans.
    this.ancestorIds.push('root');

    this.ancestorIds.reverse();
  }

  /**
   * If the mouse leaves to anywhere except another span with the same ancestor id, this span's ancestor id is
   * removed from the set of hoverIndentGuideIds.
   *
   * @param {Object} event - React Synthetic event tied to mouseleave. Includes the related target which is
   *     the element the user is now hovering.
   * @param {string} ancestorId - The span id that the user was hovering over.
   */
  handleMouseLeave = (event: React.MouseEvent<HTMLSpanElement>, ancestorId: string) => {
    if (
      !(event.relatedTarget instanceof HTMLSpanElement) ||
      _get(event, 'relatedTarget.dataset.ancestorId') !== ancestorId
    ) {
      this.props.removeHoverIndentId(ancestorId);
    }
  };

  /**
   * If the mouse entered this span from anywhere except another span with the same ancestor id, this span's
   * ancestorId is added to the set of hoverIndentGuideIds.
   *
   * @param {Object} event - React Synthetic event tied to mouseenter. Includes the related target which is
   *     the last element the user was hovering.
   * @param {string} ancestorId - The span id that the user is now hovering over.
   */
  handleMouseEnter = (event: React.MouseEvent<HTMLSpanElement>, ancestorId: string) => {
    if (
      !(event.relatedTarget instanceof HTMLSpanElement) ||
      _get(event, 'relatedTarget.dataset.ancestorId') !== ancestorId
    ) {
      this.props.addHoverIndentId(ancestorId);
    }
  };

  render() {
    const { childrenVisible, onClick, showChildrenIcon, span } = this.props;
    const { hasChildren, spanID } = span;
    const wrapperProps = hasChildren ? { onClick, role: 'switch', 'aria-checked': childrenVisible } : null;
    const icon =
      showChildrenIcon && hasChildren && (childrenVisible ? <AiOutlineArrowDown /> : <AiOutlineRight />);
    return (
      <span className={`SpanTreeOffset ${hasChildren ? 'is-parent' : ''}`} {...wrapperProps}>
        {this.ancestorIds.map(ancestorId => (
          <span
            key={ancestorId}
            className={cx('SpanTreeOffset--indentGuide', {
              'is-active': this.props.hoverIndentIds.has(ancestorId),
            })}
            data-ancestor-id={ancestorId}
            onMouseEnter={event => this.handleMouseEnter(event, ancestorId)}
            onMouseLeave={event => this.handleMouseLeave(event, ancestorId)}
          />
        ))}
        {icon && (
          <span
            className="SpanTreeOffset--iconWrapper"
            onMouseEnter={event => this.handleMouseEnter(event, spanID)}
            onMouseLeave={event => this.handleMouseLeave(event, spanID)}
          >
            {icon}
          </span>
        )}
      </span>
    );
  }
}

