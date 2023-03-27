import React, { useMemo, forwardRef } from 'react'


import classnames from 'classnames'

import { deepMerge } from '@jiaminghi/charts/lib/util/index'
import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import useAutoResize from '../autoResize'
import { Box } from '@chakra-ui/react'
import { DecorationProps } from '../types'


const defaultColor = ['#3faacb', '#fff']



const Decoration2 = forwardRef(({ reverse = false, dur = 6, className, style, color = [] }:DecorationProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  function calcSVGData() {
    return reverse
      ? { w: 1, h: height, x: width / 2, y: 0 }
      : { w: width, h: 1, x: 0, y: height / 2 }
  }

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const { x, y, w, h } = useMemo(calcSVGData, [reverse, width, height])

  const classNames = useMemo(() => classnames('dv-decoration-2', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} ref={domRef} display="flex" width="100%" height="100%" justifyContent="center" alignItems="center">
      <svg width={`${width}px`} height={`${height}px`}>
        <rect x={x} y={y} width={w} height={h} fill={mergedColor[0]}>
          <animate
            attributeName={reverse ? 'height' : 'width'}
            from='0'
            to={reverse ? height : width}
            dur={`${dur}s`}
            calcMode='spline'
            keyTimes='0;1'
            keySplines='.42,0,.58,1'
            repeatCount='indefinite'
          />
        </rect>

        <rect x={x} y={y} width='1' height='1' fill={mergedColor[1]}>
          <animate
            attributeName={reverse ? 'y' : 'x'}
            from='0'
            to={reverse ? height : width}
            dur={`${dur}s`}
            calcMode='spline'
            keyTimes='0;1'
            keySplines='0.42,0,0.58,1'
            repeatCount='indefinite'
          />
        </rect>
      </svg>
    </Box>
  )
})


export default Decoration2