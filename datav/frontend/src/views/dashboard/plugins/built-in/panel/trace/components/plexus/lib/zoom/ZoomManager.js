// Copyright (c) 2019 Uber Technologies, Inc.
//

import { select } from 'd3-selection'
import {
  zoom as d3Zoom,
  zoomTransform as getTransform,
  zoomIdentity,
} from 'd3-zoom'
import {
  constrainZoom,
  DEFAULT_SCALE_EXTENT,
  fitWithinContainer,
  getScaleExtent,
  getZoomAttr,
  getZoomStyle,
} from './utils'
export { zoomIdentity } from 'd3-zoom'
export default class ZoomManager {
  static getZoomAttr(zoomTransform) {
    return getZoomAttr(zoomTransform)
  }
  static getZoomStyle(zoomTransform) {
    return getZoomStyle(zoomTransform)
  }
  constructor(updateCallback) {
    this.elem = null
    this.contentSize = null
    this.selection = null
    this.updateCallback = void 0
    this.zoom = void 0
    this.currentTransform = zoomIdentity
    this.resetZoom = () => {
      const elem = this.elem
      const selection = this.selection
      const size = this.contentSize
      if (!elem || !selection || !size) {
        this.updateCallback(zoomIdentity)
        return
      }
      const { clientHeight: viewHeight, clientWidth: viewWidth } = elem
      this.currentTransform = fitWithinContainer(
        size.width,
        size.height,
        viewWidth,
        viewHeight,
      )
      this.zoom.transform(selection, this.currentTransform)
      this.updateCallback(this.currentTransform)
    }
    this.onZoomed = () => {
      if (!this.elem) {
        return
      }
      this.currentTransform = getTransform(this.elem)
      this.updateCallback(this.currentTransform)
    }
    this.constrainZoom = (transform, extent) => {
      if (!this.contentSize) {
        return transform
      }
      const { height, width } = this.contentSize
      const [, [vw, vh]] = extent
      return constrainZoom(transform, width, height, vw, vh)
    }
    this.updateCallback = updateCallback
    this.zoom = d3Zoom()
      .scaleExtent(DEFAULT_SCALE_EXTENT)
      .constrain(this.constrainZoom)
      .on('zoom', this.onZoomed)
  }
  setElement(elem) {
    if (elem === this.elem) {
      return
    }
    this.elem = elem
    this.selection = select(elem)
    this.selection.call(this.zoom)
    this.setExtent()
    this.resetZoom()
  }
  setContentSize(size) {
    if (
      !this.contentSize ||
      this.contentSize.height !== size.height ||
      this.contentSize.width !== size.width
    ) {
      this.contentSize = size
    }
    this.setExtent()
    this.resetZoom()
  }
  getProps() {
    const { x, y, k } = this.currentTransform
    const { height: contentHeight = 1, width: contentWidth = 1 } =
      this.contentSize || {}
    const { clientHeight: viewportHeight = 1, clientWidth: viewportWidth = 1 } =
      this.elem || {}
    return {
      contentHeight,
      contentWidth,
      k,
      viewportHeight,
      viewportWidth,
      x,
      y,
      viewAll: this.resetZoom,
    }
  }
  setExtent() {
    const elem = this.elem
    const size = this.contentSize
    if (!elem || !size) {
      return
    }
    const { clientHeight: viewHeight, clientWidth: viewWidth } = elem
    const scaleExtent = getScaleExtent(
      size.width,
      size.height,
      viewWidth,
      viewHeight,
    )
    this.zoom.scaleExtent(scaleExtent)
  }
}
