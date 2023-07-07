// Copyright (c) 2019 Uber Technologies, Inc.
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
import { ZoomTransform } from 'd3-zoom';

import { TEdge, TLayoutEdge, TLayoutGraph, TLayoutVertex, TSizeVertex, TVertex } from '../types';

import LayoutManager from '../LayoutManager';

export type TPropsFactoryFn<TInput> = (value: TInput) => Record<string, any> | null;

export type TDirectedGraphState = {
  edges: TEdge[];
  layoutEdges: TLayoutEdge[] | null;
  layoutGraph: TLayoutGraph | null;
  layoutPhase: number;
  layoutVertices: TLayoutVertex[] | null;
  sizeVertices: TSizeVertex[] | null;
  vertexRefs: React.RefObject<HTMLElement>[];
  vertices: TVertex[];
  zoomEnabled?: boolean;
  zoomTransform?: ZoomTransform;
};

export type TDirectedGraphProps<T> = {
  arrowScaleDampener?: number;
  className?: string;
  classNamePrefix?: string;
  edges: TEdge[];
  getNodeLabel?: ((vtx: TVertex<T>) => React.ReactNode) | null;
  layoutManager: LayoutManager;
  minimap?: boolean;
  minimapClassName?: string;
  setOnEdgePath?: TPropsFactoryFn<TEdge> | null;
  setOnEdgesContainer?: TPropsFactoryFn<TDirectedGraphState> | null;
  setOnNode?: TPropsFactoryFn<TVertex> | null;
  setOnNodesContainer?: TPropsFactoryFn<TDirectedGraphState> | null;
  setOnRoot?: TPropsFactoryFn<TDirectedGraphState> | null;
  vertices: TVertex[];
  zoom?: boolean;
};
