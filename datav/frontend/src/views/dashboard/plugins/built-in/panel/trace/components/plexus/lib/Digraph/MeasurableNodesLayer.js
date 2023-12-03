// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import HtmlLayer from './HtmlLayer'
import MeasurableNodes from './MeasurableNodes'
import SvgLayer from './SvgLayer'
import { ELayoutPhase, ELayerType } from './types'
function createRefs(length) {
  const rv = []
  for (let i = 0; i < length; i++) {
    rv.push(/*#__PURE__*/ React.createRef())
  }
  return rv
}
export default class MeasurableNodesLayer extends React.PureComponent {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { vertices } = nextProps.graphState
    const { vertices: stVertices } = prevState
    if (vertices === stVertices) {
      return null
    }
    return {
      vertices,
      nodeRefs: createRefs(vertices.length),
    }
  }
  constructor(props) {
    super(props)
    const { graphState } = props
    const { vertices } = graphState
    this.state = {
      vertices,
      nodeRefs: createRefs(vertices.length),
    }
  }
  componentDidMount() {
    this.measureNodes()
  }
  componentDidUpdate() {
    this.measureNodes()
  }
  measureNodes() {
    const { layoutPhase, vertices } = this.props.graphState
    if (layoutPhase !== ELayoutPhase.CalcSizes) {
      return
    }
    const { nodeRefs } = this.state
    if (!nodeRefs) {
      return
    }
    const { layerType, measureNode, senderKey, setSizeVertices } = this.props
    let current = null
    const utils = measureNode && {
      layerType,
      getWrapper: () => {
        if (current) {
          return current.getRef()
        }
        throw new Error('Invalid scenario')
      },
      getWrapperSize: () => {
        if (current) {
          return current.measure()
        }
        throw new Error('Invalid scenario')
      },
    }
    const sizeVertices = []
    for (let i = 0; i < nodeRefs.length; i++) {
      current = nodeRefs[i].current
      const vertex = vertices[i]
      if (current) {
        sizeVertices.push({
          vertex,
          ...(measureNode && utils
            ? measureNode(vertex, utils)
            : current.measure()),
        })
      }
    }
    setSizeVertices(senderKey, sizeVertices)
  }
  render() {
    const { nodeRefs } = this.state
    if (nodeRefs) {
      const {
        getClassName,
        graphState: { layoutVertices, renderUtils, vertices },
        layerType,
        renderNode,
        setOnNode,
      } = this.props
      const LayerComponent =
        layerType === ELayerType.Html ? HtmlLayer : SvgLayer
      return /*#__PURE__*/ React.createElement(
        LayerComponent,
        Object.assign(
          {
            classNamePart: 'MeasurableNodesLayer',
          },
          this.props,
        ),
        /*#__PURE__*/ React.createElement(MeasurableNodes, {
          nodeRefs: nodeRefs,
          getClassName: getClassName,
          layerType: layerType,
          renderNode: renderNode,
          renderUtils: renderUtils,
          vertices: vertices,
          layoutVertices: layoutVertices,
          setOnNode: setOnNode,
        }),
      )
    }
    return null
  }
}
