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

import { TEdge, TLayoutEdge, TLayoutGraph, TLayoutVertex, TSizeVertex } from '../types';

export enum EWorkerErrorType {
  Error = 'Error',
  LayoutError = 'LayoutError',
}

export enum ECoordinatorPhase {
  Done = 'Done',
  DotOnly = 'DotOnly',
  Edges = 'Edges',
  NotStarted = 'NotStarted',
  Positions = 'Positions',
}

export enum EWorkerPhase {
  DotOnly = ECoordinatorPhase.DotOnly,
  Edges = ECoordinatorPhase.Edges,
  Positions = ECoordinatorPhase.Positions,
}

export type TLayoutOptions = {
  rankdir?: 'TB' | 'LR' | 'BT' | 'RL';
  ranksep?: number;
  nodesep?: number;
  sep?: number;
  shape?: string;
  splines?: string;
  useDotEdges?: boolean;
  totalMemory?: number;
};

export type TLayoutWorkerMeta = {
  layoutId: number;
  workerId: number;
  phase: EWorkerPhase;
};

export type TWorkerInputMessage = {
  edges: TEdge<{}>[];
  meta: TLayoutWorkerMeta;
  options: TLayoutOptions | null;
  vertices: TSizeVertex<{}>[] | TLayoutVertex<{}>[];
};

export type TWorkerOutputMessage = {
  type: EWorkerPhase | EWorkerErrorType.LayoutError;
  edges: TLayoutEdge<{}>[] | null;
  graph: TLayoutGraph;
  layoutErrorMessage?: string;
  meta: TLayoutWorkerMeta;
  vertices: TLayoutVertex<{}>[];
};

export type TWorkerErrorMessage = {
  errorMessage: any;
  meta: TLayoutWorkerMeta | null;
  type: EWorkerErrorType.Error;
};

export type TNodesUpdate<T = Record<string, unknown>> = {
  type: ECoordinatorPhase.Positions;
  layoutId: number;
  graph: TLayoutGraph;
  vertices: TLayoutVertex<T>[];
};

export type TLayoutUpdate<T = Record<string, unknown>, U = Record<string, unknown>> = {
  type: ECoordinatorPhase.Done;
  layoutId: number;
  graph: TLayoutGraph;
  edges: TLayoutEdge<U>[];
  vertices: TLayoutVertex<T>[];
};

export type TUpdate<T = Record<string, unknown>, U = Record<string, unknown>> =
  | TNodesUpdate<T>
  | TLayoutUpdate<T, U>;
