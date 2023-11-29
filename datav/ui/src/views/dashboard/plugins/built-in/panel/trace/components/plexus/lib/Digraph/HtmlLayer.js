// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import { assignMergeCss, getProps } from './utils'
import ZoomManager from '../zoom/ZoomManager'
const STYLE = {
  left: 0,
  position: 'absolute',
  top: 0,
}
export default class HtmlLayer extends React.PureComponent {
  render() {
    const {
      children,
      classNamePart,
      getClassName,
      graphState,
      setOnContainer,
      standalone,
      topLayer,
    } = this.props
    const { zoomTransform } = graphState
    const zoomStyle = {
      style:
        topLayer || standalone ? ZoomManager.getZoomStyle(zoomTransform) : {},
    }
    const containerProps = assignMergeCss(
      {
        className: getClassName(classNamePart),
        style: STYLE,
      },
      zoomStyle,
      getProps(setOnContainer, graphState),
    )
    return /*#__PURE__*/ React.createElement('div', containerProps, children)
  }
}
