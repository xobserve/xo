// Copyright 2023 xobserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ECharts } from 'echarts'
import * as echarts from 'echarts'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { PanelProps } from 'types/dashboard'
import { Box, Center, useColorMode, useToast } from '@chakra-ui/react'
import { cloneDeep, isEmpty, isFunction } from 'lodash'
import { useSearchParam } from 'react-use'
import React from 'react'
import moment from 'moment'
import { paletteMap, palettes } from 'utils/colors'
import lodash from 'lodash'
import 'echarts/extension/bmap/bmap'
import { genDynamicFunction } from 'utils/dashboard/dynamicCall'
import { setVariable } from 'src/views/variables/SelectVariable'
import { setDateTime } from 'src/components/DatePicker/DatePicker'
import { $variables } from 'src/views/variables/store'
import NoData from 'src/views/dashboard/components/PanelNoData'
import { formatUnit } from 'src/views/dashboard/plugins/components/UnitPicker'
import { navigateTo } from 'utils/url'

const EchartsPanel = memo((props: PanelProps) => {
  const { panel, width, height } = props
  if (!panel.plugins.echarts.allowEmptyData && isEmpty(props.data)) {
    return (
      <Center height='100%'>
        <NoData />
      </Center>
    )
  }

  const { colorMode } = useColorMode()
  const toast = useToast()
  const [chart, setChart] = useState<ECharts>(null)
  const edit = useSearchParam('edit')
  const [options, onEvents] = useMemo(() => {
    const data = props.data.flat()
    let options = null
    let onEvents = null
    const colors = paletteMap[props.panel.styles.palette] ?? palettes
    const setOptions = genDynamicFunction(panel.plugins.echarts.setOptionsFunc)
    if (isFunction(setOptions)) {
      try {
        const o = setOptions(
          cloneDeep(data),
          panel.plugins.echarts.enableThresholds &&
            panel.plugins.echarts.thresholds,
          colors,
          echarts,
          lodash,
          moment,
          colorMode,
          {
            units: props.panel.plugins.echarts.value.units,
            decimal: props.panel.plugins.echarts.value.decimal,
            formatUnit: formatUnit,
          },
        )
        options = o
      } catch (error) {
        console.log('parse echarts options error', error)
      }
    } else {
      toast({
        title: 'set options error',
        description: 'The setOptions function you defined is not valid',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }

    if (chart) {
      const registerEvents = genDynamicFunction(
        panel.plugins.echarts.registerEventsFunc,
      )
      if (isFunction(registerEvents)) {
        onEvents = registerEvents
      } else {
        toast({
          title: 'register events error',
          description: 'The registerEvents function you defined is not valid',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }

    if (options) {
      options.animation = panel.plugins.echarts.animation
    }

    return [options, onEvents]
  }, [panel.plugins.echarts, props.data, chart])

  // override  echarts background in panel edit mod
  const darkBg = edit == panel.id.toString() ? 'transparent' : 'transparent' //  "#1A202C"
  return (
    <>
      {options && (
        <Box height={height} key={colorMode} className='echarts-panel'>
          <EchartsComponent
            options={options}
            theme={colorMode}
            width={width - 11}
            height={height}
            onChartCreated={(c) => setChart(c)}
            onChartEvents={panel.plugins.echarts.enableClick ? onEvents : null}
            darkBg={darkBg}
          />
        </Box>
      )}
    </>
  )
})

export default EchartsPanel

interface Props {
  options: any
  theme: string
  width: number
  height: number
  onChartCreated: (chart: ECharts) => void
  onChartEvents?: any
  darkBg?: string
}

export const EchartsComponent = ({
  options,
  theme,
  width,
  height,
  onChartCreated,
  onChartEvents,
  darkBg,
}: Props) => {
  const container = useRef(null)
  const toast = useToast()
  const [chart, setChart] = useState<ECharts>(null)

  if (theme == 'dark' && darkBg) {
    options.backgroundColor = darkBg
  }

  useEffect(() => {
    if (container.current) {
      const c = echarts.init(container.current, theme)
      setChart(c)
      tryCatchCall(() => c.setOption(options), toast)
      onChartCreated(c)
    }

    return () => {
      if (chart) {
        chart?.dispose()
        chart?.clear()
      }
    }
  }, [])

  useEffect(() => {
    if (chart) {
      tryCatchCall(() => chart.setOption(options), toast)
    }
  }, [options])

  useEffect(() => {
    if (onChartEvents && chart) {
      onChartEvents(
        options,
        chart,
        navigateTo,
        (k, v) => setVariable(k, v),
        setDateTime,
        $variables,
      )
    }
  }, [onChartEvents])

  useEffect(() => {
    if (chart) {
      tryCatchCall(() => chart.resize({ width, height }), toast)
    }
  }, [width, height])
  return (
    <Box
      ref={container}
      width={width}
      height={height}
      className='echart-container'
    />
  )
}

const tryCatchCall = (f, toast) => {
  const id = 'echarts-error'
  try {
    f()
  } catch (error) {
    if (!toast.isActive(id)) {
      toast({
        id: id,
        title: `running echarts panel error: ${error.message}`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
    }
  }
}
