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
const id = 'edgeArrow';
export const iriRef = `url(#${id})`;
export const arrowDef = /*#__PURE__*/React.createElement("marker", {
  id: id,
  markerWidth: "8",
  markerHeight: "8",
  refX: "8",
  refY: "3",
  orient: "auto",
  markerUnits: "strokeWidth"
}, /*#__PURE__*/React.createElement("path", {
  d: "M0,0 L0,6 L9,3 z",
  fill: "#000"
}));
export const defs = /*#__PURE__*/React.createElement("defs", null, arrowDef);