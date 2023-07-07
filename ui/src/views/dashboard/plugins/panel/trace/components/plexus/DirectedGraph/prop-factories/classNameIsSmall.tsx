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

import { TDirectedGraphState } from '../types';

const SCALE_THRESHOLD_SMALL = 0.29;

export default function classNameIsSmall(graphState: TDirectedGraphState) {
  const { k = 1 } = graphState.zoomTransform || {};
  if (k <= SCALE_THRESHOLD_SMALL) {
    return { className: 'is-small' };
  }
  return null;
}
