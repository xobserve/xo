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

import * as React from 'react';
class Node extends React.PureComponent {
  render() {
    const {
      classNamePrefix,
      hidden,
      labelFactory,
      vertex,
      left,
      top,
      forwardedRef,
      ...rest
    } = this.props;
    const p = rest;
    p.style = {
      ...p.style,
      position: 'absolute',
      transform: left == null || top == null ? undefined : `translate(${left}px,${top}px)`,
      visibility: hidden ? 'hidden' : undefined
    };
    p.className = `${classNamePrefix}-Node ${p.className || ''}`;
    return /*#__PURE__*/React.createElement("div", Object.assign({
      ref: forwardedRef
    }, p), labelFactory(vertex));
  }
}

// ghetto fabulous cast because the 16.3 API is not in flow yet
// https://github.com/facebook/flow/issues/6103
// eslint-disable-next-line react/no-multi-comp
Node.defaultProps = {
  hidden: false,
  left: null,
  top: null
};
export default /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React.createElement(Node, Object.assign({}, props, {
  forwardedRef: ref
})));