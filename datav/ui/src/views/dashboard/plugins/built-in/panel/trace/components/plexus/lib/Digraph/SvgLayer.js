// Copyright (c) 2019 Uber Technologies, Inc.
//

import * as React from 'react'
import SvgDefEntry from './SvgDefEntry'
import { assignMergeCss, getProps } from './utils'
import ZoomManager from '../zoom/ZoomManager'
const STYLE = {
  left: 0,
  minHeight: '100%',
  minWidth: '100%',
  position: 'absolute',
  top: 0,
}
export default class SvgLayer extends React.PureComponent {
  render() {
    const {
      children,
      classNamePart,
      getClassName,
      defs,
      extraWrapper,
      graphState,
      setOnContainer,
      standalone,
      topLayer,
    } = this.props
    const containerProps = assignMergeCss(
      {
        className: getClassName(classNamePart),
      },
      getProps(setOnContainer, graphState),
    )
    let content = /*#__PURE__*/ React.createElement(
      'g',
      containerProps,
      defs &&
        /*#__PURE__*/ React.createElement(
          'defs',
          null,
          defs.map((defEntry) =>
            /*#__PURE__*/ React.createElement(
              SvgDefEntry,
              Object.assign(
                {
                  key: defEntry.localId,
                },
                defEntry,
                {
                  getClassName: getClassName,
                  graphState: graphState,
                },
              ),
            ),
          ),
        ),
      children,
    )
    if (extraWrapper) {
      content = /*#__PURE__*/ React.createElement('g', extraWrapper, content)
    }
    if (!standalone && !topLayer) {
      return content
    }
    const { zoomTransform } = graphState
    return /*#__PURE__*/ React.createElement(
      'svg',
      {
        className: getClassName('SvgLayer'),
        style: STYLE,
      },
      /*#__PURE__*/ React.createElement(
        'g',
        {
          className: getClassName('SvgLayer--transformer'),
          transform: ZoomManager.getZoomAttr(zoomTransform),
        },
        content,
      ),
    )
  }
}
