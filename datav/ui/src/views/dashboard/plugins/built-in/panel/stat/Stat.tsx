// Copyright 2023 xObserve.io Team

import { memo, useMemo } from 'react'
import { PanelProps } from 'types/dashboard'
import 'uplot/dist/uPlot.min.css'
import React from 'react'
import { isEmpty } from 'lodash'
import { Box, Center, Flex } from '@chakra-ui/react'
import { SeriesData } from 'types/seriesData'

import { VarialbeAllOption } from 'src/data/variable'
import StatGraph from './StatGraph'
import AutoGrid from 'src/components/grid/AutoGrid'
import { isSeriesData } from 'utils/seriesData'
import NoData from 'src/views/dashboard/components/PanelNoData'

interface StatPanelProps extends PanelProps {
  data: SeriesData[][]
}

const StatPanel = memo((props: StatPanelProps) => {
  if (isEmpty(props.data)) {
    return (
      <Center height='100%'>
        <NoData />
      </Center>
    )
  }

  if (!isSeriesData(props.data)) {
    return <Center height='100%'>Data format not support!</Center>
  }

  const data: SeriesData[] = useMemo(() => {
    let res: SeriesData[] = []
    const displaySeries = props.panel.plugins.stat.displaySeries
    if (props.data.length > 0) {
      for (const d of props.data) {
        for (const s of d) {
          if (!s.rawName) {
            s.rawName = s.name
          }

          const selected =
            displaySeries == VarialbeAllOption || s.rawName == displaySeries
          if (selected) {
            res.push(s)
          }
        }
      }
    }

    return res
  }, [props.data, props.panel.plugins.stat.displaySeries])

  const options = props.panel.plugins.stat

  return (
    <>
      {options.styles.layout == 'horizontal' && (
        <>
          {data.map((seriesData, i) => {
            const h = props.height / data.length
            return (
              <Box width={props.width} height={h + 'px'}>
                <StatGraph
                  panelData={data}
                  data={seriesData}
                  panel={props.panel}
                  width={props.width}
                  height={h}
                />
              </Box>
            )
          })}
        </>
      )}
      {options.styles.layout == 'vertical' && (
        <Flex>
          {data.map((seriesData) => {
            const width = (props.width - 3) / data.length
            return (
              <Box height={props.height} width={width}>
                <StatGraph
                  panelData={data}
                  data={seriesData}
                  panel={props.panel}
                  width={width}
                  height={props.height}
                />
              </Box>
            )
          })}
        </Flex>
      )}
      {options.styles.layout == 'auto' && (
        <>
          <AutoGrid
            width={props.width}
            height={props.height}
            orientation={options.styles.layout}
            itemSpacing={0}
            autoGrid={true}
            values={data ?? []}
            renderValue={({ width, height, value }) => {
              return (
                <>
                  <Box height={height} width={width}>
                    <StatGraph
                      panelData={data}
                      data={value}
                      panel={props.panel}
                      width={width}
                      height={height}
                    />
                  </Box>
                </>
              )
            }}
          />
        </>
      )}
    </>
  )
})

export default StatPanel
