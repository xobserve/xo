import React, { useMemo, forwardRef } from 'react'

import classnames from 'classnames'

import { deepMerge } from '@jiaminghi/charts/lib/util/index'
import { deepClone } from '@jiaminghi/c-render/lib/plugin/util'

import useAutoResize from '../autoResize'
import { Box } from '@chakra-ui/react'
import { DecorationProps } from '../types'

const defaultColor = ['#7acaec', 'transparent']

const pointSideLength = 7

const svgWH = [300, 35]

const rowNum = 2

const rowPoints = 25

const halfPointSideLength = pointSideLength / 2

function getPoints() {
  const [w, h] = svgWH

  const horizontalGap = w / (rowPoints + 1)
  const verticalGap = h / (rowNum + 1)

  let points = new Array(rowNum)
    .fill(0)
    .map((foo, i) =>
      new Array(rowPoints)
        .fill(0)
        .map((foo, j) => [horizontalGap * (j + 1), verticalGap * (i + 1)])
    )

  return points.reduce((all, item) => [...all, ...item], [])
}



const Decoration3 = forwardRef(({ className, style, color = [] }:DecorationProps, ref) => {
  const { width, height, domRef } = useAutoResize(ref)

  function calcSVGData() {
    return {
      points: getPoints(),
      svgScale: [width / svgWH[0], height / svgWH[1]]
    }
  }

  const mergedColor = useMemo(() => deepMerge(deepClone(defaultColor, true), color || []), [color])

  const { svgScale, points } = useMemo(calcSVGData, [width, height])

  const classNames = useMemo(() => classnames('dv-decoration-3', className), [
    className
  ])

  return (
    <Box className={classNames} style={style} width="100%" height="100%" sx={{
        svg: {
            "transform-origin": 'left top'
        }
    }}   ref={domRef}>
      <svg
        width={`${svgWH[0]}px`}
        height={`${svgWH[1]}px`}
        style={{ transform: `scale(${svgScale[0]},${svgScale[1]})` }}
      >
        {points.map((point, i) => (
          <rect
            key={i}
            fill={mergedColor[0]}
            x={point[0] - halfPointSideLength}
            y={point[1] - halfPointSideLength}
            width={pointSideLength}
            height={pointSideLength}
          >
            {Math.random() > 0.6 && (
              <animate
                attributeName='fill'
                values={`${mergedColor.join(';')}`}
                dur={Math.random() + 1 + 's'}
                begin={Math.random() * 2}
                repeatCount='indefinite'
              />
            )}
          </rect>
        ))}
      </svg>
    </Box>
  )
})


export default Decoration3