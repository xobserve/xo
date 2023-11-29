// Copyright (c) 2019 Uber Technologies, Inc.
//

import type React from 'react'
import { ZoomTransform } from 'd3-zoom'

import {
  TEdge,
  TLayoutEdge,
  TLayoutGraph,
  TLayoutVertex,
  TSizeVertex,
  TVertex,
} from '../types'

import LayoutManager from '../LayoutManager'

export type TPropsFactoryFn<TInput> = (
  value: TInput,
) => Record<string, any> | null

export type TDirectedGraphState = {
  edges: TEdge[]
  layoutEdges: TLayoutEdge[] | null
  layoutGraph: TLayoutGraph | null
  layoutPhase: number
  layoutVertices: TLayoutVertex[] | null
  sizeVertices: TSizeVertex[] | null
  vertexRefs: React.RefObject<HTMLElement>[]
  vertices: TVertex[]
  zoomEnabled?: boolean
  zoomTransform?: ZoomTransform
}

export type TDirectedGraphProps<T> = {
  arrowScaleDampener?: number
  className?: string
  classNamePrefix?: string
  edges: TEdge[]
  getNodeLabel?: ((vtx: TVertex<T>) => React.ReactNode) | null
  layoutManager: LayoutManager
  minimap?: boolean
  minimapClassName?: string
  setOnEdgePath?: TPropsFactoryFn<TEdge> | null
  setOnEdgesContainer?: TPropsFactoryFn<TDirectedGraphState> | null
  setOnNode?: TPropsFactoryFn<TVertex> | null
  setOnNodesContainer?: TPropsFactoryFn<TDirectedGraphState> | null
  setOnRoot?: TPropsFactoryFn<TDirectedGraphState> | null
  vertices: TVertex[]
  zoom?: boolean
}
