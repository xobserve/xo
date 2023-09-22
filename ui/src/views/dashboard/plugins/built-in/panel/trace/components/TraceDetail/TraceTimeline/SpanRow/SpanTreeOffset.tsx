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

import React, { useMemo } from 'react';
import cx from 'classnames';
import _get from 'lodash/get';
import './SpanTreeOffset.css';

import { TraceSpan } from 'types/plugins/trace';
import spanAncestorIds from '../utils';
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { chakra, useColorModeValue } from '@chakra-ui/react';


type TProps = {
  childrenVisible?: boolean;
  onClick?: () => void;
  span: TraceSpan;
  showChildrenIcon?: boolean;
  hoverIndentIds: Set<string>;
  addHoverIndentId: (spanID: string) => void;
  removeHoverIndentId: (spanID: string) => void;
};

const SpanTreeOffset = (props: TProps) => {
    const { hoverIndentIds, childrenVisible=false, onClick=undefined, showChildrenIcon=true, span,addHoverIndentId,removeHoverIndentId } = props;
    const ancestorIds: string[] =  useMemo(() => {
        const sa = spanAncestorIds(props.span)
        sa.push('root');
    
        sa.reverse();
        return sa
    },[props.span])




  /**
   * If the mouse leaves to anywhere except another span with the same ancestor id, this span's ancestor id is
   * removed from the set of hoverIndentGuideIds.
   *
   * @param {Object} event - React Synthetic event tied to mouseleave. Includes the related target which is
   *     the element the user is now hovering.
   * @param {string} ancestorId - The span id that the user was hovering over.
   */
  const handleMouseLeave = (event: React.MouseEvent<HTMLSpanElement>, ancestorId: string) => {
    if (
      !(event.relatedTarget instanceof HTMLSpanElement) ||
      _get(event, 'relatedTarget.dataset.ancestorId') !== ancestorId
    ) {
      removeHoverIndentId(ancestorId);
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
  const handleMouseEnter = (event: React.MouseEvent<HTMLSpanElement>, ancestorId: string) => {
    if (
      !(event.relatedTarget instanceof HTMLSpanElement) ||
      _get(event, 'relatedTarget.dataset.ancestorId') !== ancestorId
    ) {
        addHoverIndentId(ancestorId);
    }
  };
  


    const { hasChildren, spanID } = span;
    const wrapperProps = hasChildren ? { onClick, role: 'switch', 'aria-checked': childrenVisible } : null;
    const icon =
      showChildrenIcon && hasChildren && (childrenVisible ? <BsChevronDown /> : <BsChevronRight />);
    return (
      <chakra.span className={`SpanTreeOffset ${hasChildren ? 'is-parent' : ''}`}  sx={{
        '.SpanTreeOffset--indentGuide:before': {
            content: '""',
            paddingLeft: '1px',
            backgroundColor: useColorModeValue('lightgrey', '#555')
          }
    }} {...wrapperProps}>
        {ancestorIds.map(ancestorId => (
          <span
            key={ancestorId}
            className={cx('SpanTreeOffset--indentGuide', {
              'is-active': hoverIndentIds.has(ancestorId),
            })}
            data-ancestor-id={ancestorId}
            onMouseEnter={event => handleMouseEnter(event, ancestorId)}
            onMouseLeave={event => handleMouseLeave(event, ancestorId)}
          />
        ))}
        {icon && (
          <span
            className="SpanTreeOffset--iconWrapper"
            style={{
                color: useColorModeValue('#888', '#aaa')
            }}
            onMouseEnter={event => handleMouseEnter(event, spanID)}
            onMouseLeave={event => handleMouseLeave(event, spanID)}
          >
            {icon}
          </span>
        )}
      </chakra.span>
    );
}

export default  SpanTreeOffset