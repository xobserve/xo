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

import EdgePath from './EdgePath';

import { TPropsFactoryFn } from '../types';
import { TEdge, TLayoutEdge } from '../../types';

type TProps = {
  arrowIriRef: string;
  layoutEdges: TLayoutEdge[];
  setOnEdgePath?: TPropsFactoryFn<TEdge> | null;
};

export default class PureEdges extends React.PureComponent<TProps> {
  render() {
    const { arrowIriRef, layoutEdges, setOnEdgePath } = this.props;
    return layoutEdges.map(edge => (
      <EdgePath
        key={`${edge.edge.from}\v${edge.edge.to}`}
        pathPoints={edge.pathPoints}
        markerEnd={arrowIriRef}
        {...(setOnEdgePath && setOnEdgePath(edge.edge))}
      />
    ));
  }
}
