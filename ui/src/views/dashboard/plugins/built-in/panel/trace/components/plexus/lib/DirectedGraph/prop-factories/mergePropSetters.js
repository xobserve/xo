// Copyright (c) 2018 Uber Technologies, Inc.
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

function reduce(a, b) {
  // eslint-disable-next-line prefer-const
  let {
    className,
    style,
    ...rest
  } = a;
  const {
    className: bClassName,
    style: bStyle,
    ...bRest
  } = b;
  // merge className props
  if (bClassName) {
    className = className ? `${className} ${bClassName}` : bClassName;
  }
  // merge style props
  if (bStyle && typeof bStyle === 'object') {
    style = style ? {
      ...style,
      ...bStyle
    } : bStyle;
  }
  return {
    className,
    style,
    ...rest,
    ...bRest
  };
}
export function assignMergeCss() {
  for (var _len = arguments.length, objs = new Array(_len), _key = 0; _key < _len; _key++) {
    objs[_key] = arguments[_key];
  }
  return objs.reduce(reduce);
}
export default function mergePropSetters() {
  for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    fns[_key2] = arguments[_key2];
  }
  return input => {
    const propsList = [];
    for (let i = 0; i < fns.length; i++) {
      const props = fns[i](input);
      // TypeScript doesn't believe in `.filter(Boolean)`, so do this manually
      // http://t.uber.com/joef-ts-strict-filter-boolean
      if (props) {
        propsList.push(props);
      }
    }
    return propsList.reduce(reduce);
  };
}