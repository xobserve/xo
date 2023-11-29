// Copyright 2023 xObserve.io Team

import React from 'react'
import { memo, useEffect, useRef, useState } from 'react'
import { useSearchParam } from 'react-use'
import * as echarts from 'echarts'
import { Box } from '@chakra-ui/react'

interface Props {
  options: any
  theme: string
  width?: number
  height?: number
  onChartCreated: (chart) => void
  onChartEvents?: any
  clearWhenSetOption?: boolean
}

export const ChartComponent = memo((props: Props) => {
  const {
    options,
    theme,
    onChartCreated,
    onChartEvents,
    clearWhenSetOption = false,
  } = props
  // echarts is weirdly widther than the container, so we need to subtract 15
  const width = props.width ? props.width - 11 : null
  const height = props.height ? props.height - 3 : null
  const edit = useSearchParam('edit')
  const container = useRef(null)
  const [chart, setChart] = useState(null)

  if (theme == 'dark') {
    if (edit) {
      options.backgroundColor = 'transparent'
    } else {
      options.backgroundColor = 'transparent'
      //  "#1A202C"
    }
  }

  useEffect(() => {
    if (container.current) {
      const c = echarts.init(container.current, theme)
      setChart(c)
      c.setOption(options)
      onChartCreated(c)
      registerEvents(c)
    }

    return () => {
      if (chart) {
        chart?.dispose()
        chart?.clear()
        chart.off('click')
      }
    }
  }, [])

  useEffect(() => {
    if (chart) {
      if (clearWhenSetOption) {
        chart?.clear()
      }
      chart.setOption(options)
    }
  }, [options])

  useEffect(() => {
    if (onChartEvents && chart) {
      registerEvents()
    }
  }, [onChartEvents])

  useEffect(() => {
    if (chart) {
      chart.resize({ width, height })
    }
  }, [width, height])

  const registerEvents = (c?) => {
    const ct = c ?? chart
    ct.off('click')
    ct.on('click', onChartEvents)
  }
  return (
    <Box
      ref={container}
      width={width ?? '100%'}
      height={height ?? '100%'}
      className='echart-container'
    />
  )
})

export default ChartComponent
