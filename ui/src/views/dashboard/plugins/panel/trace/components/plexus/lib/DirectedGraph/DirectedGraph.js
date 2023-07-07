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
import EdgeArrowDef from './builtins/EdgeArrowDef';
import EdgesContainer from './builtins/EdgesContainer';
import PureEdges from './builtins/PureEdges';
import PureNodes from './builtins/PureNodes';
import classNameIsSmall from './prop-factories/classNameIsSmall';
import mergePropSetters, { assignMergeCss } from './prop-factories/mergePropSetters';
import scaledStrokeWidth from './prop-factories/scaledStrokeWidth';
import MiniMap from '../zoom/MiniMap';
import ZoomManager, { zoomIdentity } from '../zoom/ZoomManager';
const PHASE_NO_DATA = 0;
const PHASE_CALC_SIZES = 1;
const PHASE_CALC_POSITIONS = 2;
const PHASE_CALC_EDGES = 3;
const PHASE_DONE = 4;
const WRAPPER_STYLE_ZOOM = {
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  width: '100%'
};
const WRAPPER_STYLE = {
  position: 'relative'
};
let idCounter = 0;
function createHtmlRefs(length) {
  const rv = [];
  for (let i = 0; i < length; i++) {
    rv.push( /*#__PURE__*/React.createRef());
  }
  return rv;
}
export default class DirectedGraph extends React.PureComponent {
  // eslint-disable-next-line react/sort-comp

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      edges,
      vertices,
      zoom: zoomEnabled
    } = nextProps;
    const {
      edges: stEdges,
      vertices: stVertices,
      zoomEnabled: stZoomEnabled
    } = prevState;
    if (zoomEnabled !== stZoomEnabled) {
      throw new Error('Zoom cannot be toggled');
    }
    if (edges === stEdges && vertices === stVertices) {
      return null;
    }
    return {
      edges,
      vertices,
      layoutPhase: PHASE_CALC_SIZES,
      vertexRefs: createHtmlRefs(vertices.length),
      sizeVertices: null,
      layoutEdges: null,
      layoutGraph: null,
      layoutVertices: null
    };
  }
  constructor(props) {
    super(props);
    this.arrowId = void 0;
    this.arrowIriRef = void 0;
    this.rootRef = void 0;
    this.rootSelection = void 0;
    this.zoomManager = void 0;
    this.state = {
      edges: [],
      layoutPhase: PHASE_NO_DATA,
      sizeVertices: null,
      layoutEdges: null,
      layoutGraph: null,
      layoutVertices: null,
      vertexRefs: [],
      vertices: [],
      zoomEnabled: false,
      zoomTransform: zoomIdentity
    };
    this._onPositionsDone = result => {
      if (!result.isCancelled) {
        const {
          graph: layoutGraph,
          vertices: layoutVertices
        } = result;
        this.setState({
          layoutGraph,
          layoutVertices,
          layoutPhase: PHASE_CALC_EDGES
        });
      }
    };
    this._onLayoutDone = result => {
      const root = this.rootRef.current;
      if (result.isCancelled || !root) {
        return;
      }
      const {
        edges: layoutEdges,
        graph: layoutGraph,
        vertices: layoutVertices
      } = result;
      this.setState({
        layoutEdges,
        layoutGraph,
        layoutVertices,
        layoutPhase: PHASE_DONE
      });
      if (this.zoomManager) {
        this.zoomManager.setContentSize(layoutGraph);
      }
    };
    this._onZoomUpdated = zoomTransform => {
      this.setState({
        zoomTransform
      });
    };
    const {
      edges,
      vertices,
      zoom: zoomEnabled
    } = props;
    if (Array.isArray(edges) && edges.length && Array.isArray(vertices) && vertices.length) {
      this.state.layoutPhase = PHASE_CALC_SIZES;
      this.state.edges = edges;
      this.state.vertices = vertices;
      this.state.vertexRefs = createHtmlRefs(vertices.length);
    }
    this.state.zoomEnabled = zoomEnabled;
    const idBase = `plexus--DirectedGraph--${idCounter}`;
    idCounter += 1;
    this.arrowId = EdgeArrowDef.getId(idBase);
    this.arrowIriRef = EdgeArrowDef.getIriRef(idBase);
    this.rootRef = /*#__PURE__*/React.createRef();
    if (zoomEnabled) {
      this.zoomManager = new ZoomManager(this._onZoomUpdated);
    } else {
      this.zoomManager = null;
    }
  }
  componentDidMount() {
    this._setSizeVertices();
    const {
      current
    } = this.rootRef;
    if (current && this.zoomManager) {
      this.zoomManager.setElement(current);
    }
  }
  componentDidUpdate() {
    const {
      layoutPhase
    } = this.state;
    if (layoutPhase === PHASE_CALC_SIZES) {
      this._setSizeVertices();
    }
  }
  _setSizeVertices() {
    const {
      edges,
      layoutManager,
      vertices
    } = this.props;
    const sizeVertices = [];
    this.state.vertexRefs.forEach((ref, i) => {
      const {
        current
      } = ref;
      // use a `.forEach` with a guard on `current` because TypeScript doesn't
      // like `.filter(Boolean)`
      if (current) {
        sizeVertices.push({
          height: current.offsetHeight,
          vertex: vertices[i],
          width: current.offsetWidth
        });
      }
    });
    const {
      positions,
      layout
    } = layoutManager.getLayout(edges, sizeVertices);
    positions.then(this._onPositionsDone);
    layout.then(this._onLayoutDone);
    this.setState({
      sizeVertices,
      layoutPhase: PHASE_CALC_POSITIONS
    });
  }
  _renderVertices() {
    const {
      classNamePrefix,
      getNodeLabel,
      setOnNode,
      vertices
    } = this.props;
    const {
      layoutVertices,
      vertexRefs
    } = this.state;
    return /*#__PURE__*/React.createElement(PureNodes, {
      classNamePrefix: classNamePrefix,
      getNodeLabel: getNodeLabel || String,
      layoutVertices: layoutVertices,
      setOnNode: setOnNode,
      vertexRefs: vertexRefs,
      vertices: vertices
    });
  }
  _renderEdges() {
    const {
      setOnEdgePath
    } = this.props;
    const {
      layoutEdges
    } = this.state;
    return layoutEdges && /*#__PURE__*/React.createElement(PureEdges, {
      setOnEdgePath: setOnEdgePath,
      layoutEdges: layoutEdges,
      arrowIriRef: this.arrowIriRef
    });
  }
  render() {
    const {
      arrowScaleDampener,
      className,
      classNamePrefix,
      minimap: minimapEnabled,
      minimapClassName,
      setOnEdgesContainer,
      setOnNodesContainer,
      setOnRoot
    } = this.props;
    const {
      layoutPhase: phase,
      layoutGraph,
      zoomEnabled,
      zoomTransform
    } = this.state;
    const {
      height = 0,
      width = 0
    } = layoutGraph || {};
    // const { current: rootElm } = this.rootRef;
    const haveEdges = phase === PHASE_DONE;
    const nodesContainerProps = assignMergeCss(setOnNodesContainer && setOnNodesContainer(this.state) || {}, {
      style: {
        ...(zoomEnabled ? ZoomManager.getZoomStyle(zoomTransform) : null),
        position: 'absolute',
        top: 0,
        left: 0
      },
      className: `${classNamePrefix}-DirectedGraph--nodeContainer`
    });
    const edgesContainerProps = assignMergeCss(setOnEdgesContainer && setOnEdgesContainer(this.state) || {}, {
      style: {
        minHeight: '100%',
        minWidth: '100%'
      },
      className: `${classNamePrefix}-DirectedGraph--nodeContainer`
    });
    const rootProps = assignMergeCss(setOnRoot && setOnRoot(this.state) || {}, {
      style: zoomEnabled ? WRAPPER_STYLE_ZOOM : WRAPPER_STYLE,
      className: `${classNamePrefix}-DirectedGraph ${className}`
    });
    return /*#__PURE__*/React.createElement("div", Object.assign({}, rootProps, {
      ref: this.rootRef
    }), layoutGraph && haveEdges && /*#__PURE__*/React.createElement(EdgesContainer, Object.assign({}, edgesContainerProps, {
      height: height,
      width: width
    }), /*#__PURE__*/React.createElement(EdgeArrowDef, {
      id: this.arrowId,
      scaleDampener: arrowScaleDampener,
      zoomScale: zoomEnabled && zoomTransform ? zoomTransform.k : null
    }), /*#__PURE__*/React.createElement("g", {
      transform: zoomEnabled ? ZoomManager.getZoomAttr(zoomTransform) : undefined
    }, this._renderEdges())), /*#__PURE__*/React.createElement("div", nodesContainerProps, this._renderVertices()), zoomEnabled && minimapEnabled && this.zoomManager && /*#__PURE__*/React.createElement(MiniMap, Object.assign({
      className: minimapClassName,
      classNamePrefix: classNamePrefix
    }, this.zoomManager.getProps())));
  }
}
DirectedGraph.propsFactories = {
  classNameIsSmall,
  mergePropSetters,
  scaledStrokeWidth
};
DirectedGraph.defaultProps = {
  arrowScaleDampener: undefined,
  className: '',
  classNamePrefix: 'plexus',
  // getNodeLabel: defaultGetNodeLabel,
  minimap: false,
  minimapClassName: '',
  zoom: false
};