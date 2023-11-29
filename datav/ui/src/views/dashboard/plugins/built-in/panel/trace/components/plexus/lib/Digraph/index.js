// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import memoizeOne from 'memoize-one'
import HtmlLayersGroup from './HtmlLayersGroup'
import MeasurableNodesLayer from './MeasurableNodesLayer'
import NodesLayer from './NodesLayer'
import { classNameIsSmall, scaleProperty } from './props-factories'
import SvgEdgesLayer from './SvgEdgesLayer'
import SvgLayersGroup from './SvgLayersGroup'
import { ELayoutPhase, ELayerType } from './types'
import { assignMergeCss, getProps } from './utils'
// TODO(joe): don't use stuff in ../DirectedGraph

import MiniMap from '../zoom/MiniMap'
import ZoomManager, { zoomIdentity } from '../zoom/ZoomManager'
const WRAPPER_STYLE_ZOOM = {
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  width: '100%',
}
const WRAPPER_STYLE = {
  position: 'relative',
}
let idCounter = 0
export default class Digraph extends React.PureComponent {
  // eslint-disable-next-line react/sort-comp

  constructor(props) {
    super(props)
    this.renderUtils = void 0
    this.state = {
      edges: [],
      layoutEdges: null,
      layoutGraph: null,
      layoutPhase: ELayoutPhase.NoData,
      layoutVertices: null,
      sizeVertices: null,
      vertices: [],
      zoomTransform: zoomIdentity,
    }
    this.baseId = `plexus--Digraph--${idCounter++}`
    this.makeClassNameFactory = memoizeOne((classNamePrefix) => {
      return (name) => `${classNamePrefix} ${classNamePrefix}-Digraph--${name}`
    })
    this.rootRef = /*#__PURE__*/ React.createRef()
    this.zoomManager = null
    this.getGlobalId = (name) => `${this.baseId}--${name}`
    this.getZoomTransform = () => this.state.zoomTransform
    this.setSizeVertices = (senderKey, sizeVertices) => {
      const {
        edges,
        layoutManager,
        measurableNodesKey: expectedKey,
      } = this.props
      if (senderKey !== expectedKey) {
        const values = `expected ${JSON.stringify(
          expectedKey,
        )}, recieved ${JSON.stringify(senderKey)}`
        throw new Error(`Key mismatch for measuring nodes; ${values}`)
      }
      this.setState({
        sizeVertices,
      })
      const { layout } = layoutManager.getLayout(edges, sizeVertices)
      layout.then(this.onLayoutDone)
      this.setState({
        sizeVertices,
        layoutPhase: ELayoutPhase.CalcPositions,
      })
      // We can add support for drawing nodes in the correct position before we have edges
      // via the following (instead of the above)
      // const { positions, layout } = layoutManager.getLayout(edges, sizeVertices);
      // positions.then(this._onPositionsDone);
    }
    this.onZoomUpdated = (zoomTransform) => {
      this.setState({
        zoomTransform,
      })
    }
    this.onLayoutDone = (result) => {
      if (result.isCancelled) {
        return
      }
      const {
        edges: layoutEdges,
        graph: layoutGraph,
        vertices: layoutVertices,
      } = result
      this.setState({
        layoutEdges,
        layoutGraph,
        layoutVertices,
        layoutPhase: ELayoutPhase.Done,
      })
      if (this.zoomManager) {
        this.zoomManager.setContentSize(layoutGraph)
      }
    }
    const { edges: _edges, vertices, zoom: zoomEnabled } = props
    if (
      Array.isArray(_edges) &&
      _edges.length &&
      Array.isArray(vertices) &&
      vertices.length
    ) {
      this.state.layoutPhase = ELayoutPhase.CalcSizes
      this.state.edges = _edges
      this.state.vertices = vertices
    }
    if (zoomEnabled) {
      this.zoomManager = new ZoomManager(this.onZoomUpdated)
    }
    this.renderUtils = {
      getGlobalId: this.getGlobalId,
      getZoomTransform: this.getZoomTransform,
    }
  }
  componentDidMount() {
    const { current } = this.rootRef
    if (current && this.zoomManager) {
      this.zoomManager.setElement(current)
    }
  }
  renderLayers() {
    const { classNamePrefix, layers: topLayers } = this.props
    const getClassName = this.makeClassNameFactory(classNamePrefix || '')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sizeVertices: _, ...partialGraphState } = this.state
    const graphState = {
      ...partialGraphState,
      renderUtils: this.renderUtils,
    }
    const { layoutPhase } = graphState
    return topLayers.map((layer) => {
      const { layerType, key, setOnContainer } = layer
      if (layer.layers) {
        if (layer.layerType === ELayerType.Html) {
          return /*#__PURE__*/ React.createElement(HtmlLayersGroup, {
            key: key,
            graphState: graphState,
            layers: layer.layers,
            getClassName: getClassName,
            setOnContainer: setOnContainer,
            setSizeVertices: this.setSizeVertices,
          })
        }
        // svg group layer, the if is for TypeScript
        if (layer.layerType === ELayerType.Svg) {
          return /*#__PURE__*/ React.createElement(SvgLayersGroup, {
            key: key,
            getClassName: getClassName,
            defs: layer.defs,
            graphState: graphState,
            layers: layer.layers,
            setOnContainer: setOnContainer,
          })
        }
      }
      if (layer.edges) {
        // edges standalone layer
        const { defs, markerEndId, markerStartId, setOnEdge } = layer
        return layoutPhase === ELayoutPhase.Done
          ? /*#__PURE__*/ React.createElement(SvgEdgesLayer, {
              key: key,
              standalone: true,
              getClassName: getClassName,
              defs: defs,
              graphState: graphState,
              markerEndId: markerEndId,
              markerStartId: markerStartId,
              setOnContainer: setOnContainer,
              setOnEdge: setOnEdge,
            })
          : null
      }
      if (layer.measurable) {
        // standalone measurable Nodes Layer
        const { measureNode, renderNode, setOnNode } = layer
        return /*#__PURE__*/ React.createElement(MeasurableNodesLayer, {
          key: key,
          standalone: true,
          getClassName: getClassName,
          graphState: graphState,
          layerType: layerType,
          measureNode: measureNode,
          renderNode: renderNode,
          senderKey: key,
          setOnContainer: setOnContainer,
          setOnNode: setOnNode,
          setSizeVertices: this.setSizeVertices,
        })
      }
      const { renderNode } = layer
      if (renderNode !== undefined) {
        return /*#__PURE__*/ React.createElement(NodesLayer, {
          key: key,
          standalone: true,
          getClassName: getClassName,
          graphState: graphState,
          layerType: layer.layerType,
          renderNode: renderNode,
          setOnContainer: setOnContainer,
          setOnNode: layer.setOnNode,
        })
      }
      throw new Error('Unrecognized layer')
    })
  }
  render() {
    const {
      className,
      classNamePrefix,
      minimap: minimapEnabled,
      minimapClassName,
      setOnGraph,
      style,
    } = this.props
    const builtinStyle = this.zoomManager ? WRAPPER_STYLE_ZOOM : WRAPPER_STYLE
    const rootProps = assignMergeCss(
      {
        style: builtinStyle,
        className: `${classNamePrefix} ${classNamePrefix}-Digraph`,
      },
      {
        className,
        style,
      },
      getProps(setOnGraph, {
        ...this.state,
        renderUtils: this.renderUtils,
      }),
    )
    return /*#__PURE__*/ React.createElement(
      'div',
      rootProps,
      /*#__PURE__*/ React.createElement(
        'div',
        {
          style: builtinStyle,
          ref: this.rootRef,
        },
        this.renderLayers(),
      ),
      minimapEnabled &&
        this.zoomManager &&
        /*#__PURE__*/ React.createElement(
          MiniMap,
          Object.assign(
            {
              className: minimapClassName,
              classNamePrefix: classNamePrefix,
            },
            this.zoomManager.getProps(),
          ),
        ),
    )
  }
}
Digraph.propsFactories = {
  classNameIsSmall,
  scaleOpacity: scaleProperty.opacity,
  scaleStrokeOpacity: scaleProperty.strokeOpacity,
  scaleStrokeOpacityStrong: scaleProperty.strokeOpacityStrong,
  scaleStrokeOpacityStrongest: scaleProperty.strokeOpacityStrongest,
}
Digraph.scaleProperty = scaleProperty
Digraph.defaultProps = {
  className: '',
  classNamePrefix: 'plexus',
  minimap: false,
  minimapClassName: '',
  zoom: false,
}
