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
import memoizeOne from 'memoize-one';

import HtmlLayersGroup from './HtmlLayersGroup';
import MeasurableNodesLayer from './MeasurableNodesLayer';
import NodesLayer from './NodesLayer';
import { classNameIsSmall, scaleProperty } from './props-factories';
import SvgEdgesLayer from './SvgEdgesLayer';
import SvgLayersGroup from './SvgLayersGroup';
import {
  ELayoutPhase,
  TExposedGraphState,
  TFromGraphStateFn,
  TLayer,
  TRendererUtils,
  ELayerType,
  TSetProps,
} from './types';
import { assignMergeCss, getProps } from './utils';
// TODO(joe): don't use stuff in ../DirectedGraph
import LayoutManager from '../LayoutManager';
import { TCancelled, TEdge, TLayoutDone, TSizeVertex, TVertex } from '../types';
import TNonEmptyArray from '../types/TNonEmptyArray';
import MiniMap from '../zoom/MiniMap';
import ZoomManager, { zoomIdentity, ZoomTransform } from '../zoom/ZoomManager';

type TDigraphState<T = {}, U = {}> = Omit<TExposedGraphState<T, U>, 'renderUtils'> & {
  sizeVertices: TSizeVertex<T>[] | null;
};

type TDigraphProps<T = unknown, U = unknown> = {
  className?: string;
  classNamePrefix?: string;
  edges: TEdge<U>[];
  layers: TNonEmptyArray<TLayer<T, U>>;
  layoutManager: LayoutManager;
  measurableNodesKey: string;
  minimap?: boolean;
  minimapClassName?: string;
  setOnGraph?: TSetProps<TFromGraphStateFn<T, U>>;
  style?: React.CSSProperties;
  vertices: TVertex<T>[];
  zoom?: boolean;
};

const WRAPPER_STYLE_ZOOM: React.CSSProperties = {
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
};

const WRAPPER_STYLE: React.CSSProperties = {
  position: 'relative',
};

let idCounter = 0;

export default class Digraph<T = unknown, U = unknown> extends React.PureComponent<
  TDigraphProps<T, U>,
  TDigraphState<T, U>
> {
  renderUtils: TRendererUtils;

  // eslint-disable-next-line react/sort-comp
  static propsFactories: Record<string, TFromGraphStateFn<any, any>> = {
    classNameIsSmall,
    scaleOpacity: scaleProperty.opacity,
    scaleStrokeOpacity: scaleProperty.strokeOpacity,
    scaleStrokeOpacityStrong: scaleProperty.strokeOpacityStrong,
    scaleStrokeOpacityStrongest: scaleProperty.strokeOpacityStrongest,
  };

  static scaleProperty = scaleProperty;

  static defaultProps = {
    className: '',
    classNamePrefix: 'plexus',
    minimap: false,
    minimapClassName: '',
    zoom: false,
  };

  state: TDigraphState<T, U> = {
    edges: [],
    layoutEdges: null,
    layoutGraph: null,
    layoutPhase: ELayoutPhase.NoData,
    layoutVertices: null,
    sizeVertices: null,
    vertices: [],
    zoomTransform: zoomIdentity,
  };

  baseId = `plexus--Digraph--${idCounter++}`;

  makeClassNameFactory = memoizeOne((classNamePrefix: string) => {
    return (name: string) => `${classNamePrefix} ${classNamePrefix}-Digraph--${name}`;
  });

  rootRef: React.RefObject<HTMLDivElement> = React.createRef();

  zoomManager: ZoomManager | null = null;

  constructor(props: TDigraphProps<T, U>) {
    super(props);
    const { edges, vertices, zoom: zoomEnabled } = props;
    if (Array.isArray(edges) && edges.length && Array.isArray(vertices) && vertices.length) {
      this.state.layoutPhase = ELayoutPhase.CalcSizes;
      this.state.edges = edges;
      this.state.vertices = vertices;
    }
    if (zoomEnabled) {
      this.zoomManager = new ZoomManager(this.onZoomUpdated);
    }
    this.renderUtils = {
      getGlobalId: this.getGlobalId,
      getZoomTransform: this.getZoomTransform,
    };
  }

  componentDidMount() {
    const { current } = this.rootRef;
    if (current && this.zoomManager) {
      this.zoomManager.setElement(current);
    }
  }

  getGlobalId = (name: string) => `${this.baseId}--${name}`;

  getZoomTransform = () => this.state.zoomTransform;

  private setSizeVertices = (senderKey: string, sizeVertices: TSizeVertex<T>[]) => {
    const { edges, layoutManager, measurableNodesKey: expectedKey } = this.props;
    if (senderKey !== expectedKey) {
      const values = `expected ${JSON.stringify(expectedKey)}, recieved ${JSON.stringify(senderKey)}`;
      throw new Error(`Key mismatch for measuring nodes; ${values}`);
    }
    this.setState({ sizeVertices });
    const { layout } = layoutManager.getLayout(edges, sizeVertices);
    layout.then(this.onLayoutDone);
    this.setState({ sizeVertices, layoutPhase: ELayoutPhase.CalcPositions });
    // We can add support for drawing nodes in the correct position before we have edges
    // via the following (instead of the above)
    // const { positions, layout } = layoutManager.getLayout(edges, sizeVertices);
    // positions.then(this._onPositionsDone);
  };

  private renderLayers() {
    const { classNamePrefix, layers: topLayers } = this.props;
    const getClassName = this.makeClassNameFactory(classNamePrefix || '');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sizeVertices: _, ...partialGraphState } = this.state;
    const graphState = {
      ...partialGraphState,
      renderUtils: this.renderUtils,
    };
    const { layoutPhase } = graphState;
    return topLayers.map(layer => {
      const { layerType, key, setOnContainer } = layer;
      if (layer.layers) {
        if (layer.layerType === ELayerType.Html) {
          return (
            <HtmlLayersGroup<T, U>
              key={key}
              graphState={graphState}
              layers={layer.layers}
              getClassName={getClassName}
              setOnContainer={setOnContainer}
              setSizeVertices={this.setSizeVertices}
            />
          );
        }
        // svg group layer, the if is for TypeScript
        if (layer.layerType === ELayerType.Svg) {
          return (
            <SvgLayersGroup<T, U>
              key={key}
              getClassName={getClassName}
              defs={layer.defs}
              graphState={graphState}
              layers={layer.layers}
              setOnContainer={setOnContainer}
            />
          );
        }
      }
      if (layer.edges) {
        // edges standalone layer
        const { defs, markerEndId, markerStartId, setOnEdge } = layer;
        return layoutPhase === ELayoutPhase.Done ? (
          <SvgEdgesLayer
            key={key}
            standalone
            getClassName={getClassName}
            defs={defs}
            graphState={graphState}
            markerEndId={markerEndId}
            markerStartId={markerStartId}
            setOnContainer={setOnContainer}
            setOnEdge={setOnEdge}
          />
        ) : null;
      }
      if (layer.measurable) {
        // standalone measurable Nodes Layer
        const { measureNode, renderNode, setOnNode } = layer;
        return (
          <MeasurableNodesLayer<T, U>
            key={key}
            standalone
            getClassName={getClassName}
            graphState={graphState}
            layerType={layerType}
            measureNode={measureNode}
            renderNode={renderNode}
            senderKey={key}
            setOnContainer={setOnContainer}
            setOnNode={setOnNode}
            setSizeVertices={this.setSizeVertices}
          />
        );
      }
      const { renderNode } = layer;
      if (renderNode !== undefined) {
        return (
          <NodesLayer<T, U>
            key={key}
            standalone
            getClassName={getClassName}
            graphState={graphState}
            layerType={layer.layerType}
            renderNode={renderNode}
            setOnContainer={setOnContainer}
            setOnNode={layer.setOnNode}
          />
        );
      }
      throw new Error('Unrecognized layer');
    });
  }

  private onZoomUpdated = (zoomTransform: ZoomTransform) => {
    this.setState({ zoomTransform });
  };

  private onLayoutDone = (result: TCancelled | TLayoutDone<T, U>) => {
    if (result.isCancelled) {
      return;
    }
    const { edges: layoutEdges, graph: layoutGraph, vertices: layoutVertices } = result;
    this.setState({ layoutEdges, layoutGraph, layoutVertices, layoutPhase: ELayoutPhase.Done });
    if (this.zoomManager) {
      this.zoomManager.setContentSize(layoutGraph);
    }
  };

  render() {
    const {
      className,
      classNamePrefix,
      minimap: minimapEnabled,
      minimapClassName,
      setOnGraph,
      style,
    } = this.props;
    const builtinStyle = this.zoomManager ? WRAPPER_STYLE_ZOOM : WRAPPER_STYLE;
    const rootProps = assignMergeCss(
      {
        style: builtinStyle,
        className: `${classNamePrefix} ${classNamePrefix}-Digraph`,
      },
      { className, style },
      getProps(setOnGraph, { ...this.state, renderUtils: this.renderUtils })
    );
    return (
      <div {...rootProps}>
        <div style={builtinStyle} ref={this.rootRef}>
          {this.renderLayers()}
        </div>
        {minimapEnabled && this.zoomManager && (
          <MiniMap
            className={minimapClassName}
            classNamePrefix={classNamePrefix}
            {...this.zoomManager.getProps()}
          />
        )}
      </div>
    );
  }
}
