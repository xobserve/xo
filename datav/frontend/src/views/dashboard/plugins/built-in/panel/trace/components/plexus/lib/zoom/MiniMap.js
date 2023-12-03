// Copyright (c) 2017 Uber Technologies, Inc.
//

import * as React from 'react'
import resetZoomIcon from './resetZoomIcon'

/* eslint-disable react/no-unused-prop-types */

/* eslint-enable react/no-unused-prop-types */

const LENGTH_TARGET_PX = 80
function getMapSize(props) {
  const { contentHeight: ch, contentWidth: cw } = props
  if (ch > cw) {
    return {
      height: LENGTH_TARGET_PX,
      width: (LENGTH_TARGET_PX * cw) / ch,
    }
  }
  return {
    height: (LENGTH_TARGET_PX * ch) / cw,
    width: LENGTH_TARGET_PX,
  }
}
function getViewTransform(props, displaySize) {
  const {
    contentHeight: ch,
    contentWidth: cw,
    viewportHeight: vh,
    viewportWidth: vw,
    k = 1,
    x = 1,
    y = 1,
  } = props
  const { height: dh, width: dw } = displaySize
  const sch = ch * k
  const scw = cw * k
  const left = Math.max(-x / scw, 0)
  const right = Math.min((-x + vw) / scw, 1)
  const top = Math.max(-y / sch, 0)
  const bottom = Math.min((-y + vh) / sch, 1)
  return {
    transform: `
      translate(${(left * dw).toFixed(2)}px, ${(top * dh).toFixed(2)}px)
      scale(${right - left}, ${bottom - top})
    `,
    transformOrigin: '0 0',
  }
}
function getClassNames(props) {
  const { className, classNamePrefix } = props
  const base = `${classNamePrefix || 'plexus'}-MiniMap`
  return {
    root: `${base} ${className || ''}`,
    item: `${base}--item`,
    map: `${base}--map`,
    mapActive: `${base}--mapActive`,
    button: `${base}--button`,
  }
}
export function MiniMap(props) {
  const css = getClassNames(props)
  const mapSize = getMapSize(props)
  const activeXform = getViewTransform(props, mapSize)
  return /*#__PURE__*/ React.createElement(
    'div',
    {
      className: css.root,
    },
    /*#__PURE__*/ React.createElement(
      'div',
      {
        className: `${css.item} ${css.map}`,
        style: mapSize,
      },
      /*#__PURE__*/ React.createElement('div', {
        className: css.mapActive,
        style: {
          ...activeXform,
          ...mapSize,
        },
      }),
    ),
    /*#__PURE__*/ React.createElement(
      'div',
      {
        className: `${css.item} ${css.button}`,
        onClick: props.viewAll,
        role: 'button',
      },
      resetZoomIcon,
    ),
  )
}
MiniMap.defaultProps = {
  className: '',
  classNamePrefix: 'plexus',
}
export default /*#__PURE__*/ React.memo(MiniMap)
