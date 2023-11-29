// Copyright 2023 xObserve.io Team

import { useColorMode, useColorModeValue } from '@chakra-ui/react'
import { getCurrentTimeRange } from 'src/components/DatePicker/TimePicker'
import ChartComponent from 'src/components/charts/Chart'
import { floor, round } from 'lodash'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { Panel } from 'types/dashboard'
import { dateTimeFormat } from 'utils/datetime/formatter'
import { isEmpty } from 'utils/validate'
import { measureText } from 'utils/measureText'
import { formatUnit } from 'src/views/dashboard/plugins/components/UnitPicker'
import { calculateInterval } from 'utils/datetime/range'
import {
  DatasourceMaxDataPoints,
  DatasourceMinInterval,
} from 'src/data/constants'
import { alpha } from 'src/components/uPlot/colorManipulator'
import {
  getTextColorForAlphaBackground,
  paletteColorNameToHex,
} from 'utils/colors'
import { ThresholdDisplay } from 'types/panel/plugins'
import { ThresholdsMode } from 'types/threshold'
import {
  findOverride,
  findOverrideRule,
  findRuleInOverride,
} from 'utils/dashboard/panel'
import { BarRules } from './OverridesEditor'
import {
  commonInteractionEvent,
  genDynamicFunction,
} from 'utils/dashboard/dynamicCall'
import { getTimeFormatForChart } from 'utils/format'

interface Props {
  data: any[]
  panel: Panel
  width: number
  height: number
}

const BarChart = memo((props: Props) => {
  const { panel, width, height } = props
  const options = panel.plugins.bar
  const [chart, setChart] = useState<echarts.ECharts>(null)
  const { colorMode } = useColorMode()
  useEffect(() => {
    if (chart) {
      chart.on('click', function (event) {
        if (event.seriesName != 'total') {
          // onSelect(event.seriesName)
        }
      })
    }
    return () => {
      chart?.off('click')
    }
  }, [chart])
  let [timeline, names, data0, rawNames] = useMemo(() => {
    const names = []
    const rawNames = []
    const data = []
    if (isEmpty(props.data)) {
      return [[], names, data, rawNames]
    }
    const timeRange = getCurrentTimeRange()
    let start = round(timeRange.start.getTime() / 1000)
    const dataStart = round(props.data[0].timestamps[0])
    if (dataStart < start) {
      start = dataStart
    }

    const now = new Date()
    let timeline = []
    props.data.forEach((series, i) => {
      if (i == 0) {
        timeline = series.timestamps.map((t) => t * 1000)
      }

      names.push(series.name)
      rawNames.push(series.rawName)
      data.push(series.values)
    })

    const ds = panel.datasource
    const intervalObj = calculateInterval(
      timeRange,
      ds.queryOptions.maxDataPoints ?? DatasourceMaxDataPoints,
      isEmpty(ds.queryOptions.minInterval)
        ? DatasourceMinInterval
        : ds.queryOptions.minInterval,
    )
    const timeFormat = getTimeFormatForChart(
      start * 1000,
      now.getTime(),
      intervalObj.intervalMs / 1000,
    )

    return [
      timeline.map((t) => dateTimeFormat(t, { format: timeFormat })),
      names,
      data,
      rawNames,
    ]
  }, [props.data])

  const max = Math.max(...data0.flat())

  let data = useMemo(() => {
    data0.forEach((d, i) => {
      const rawName = rawNames[i]
      const negativeY = findOverrideRule(
        panel,
        rawName,
        BarRules.SeriesNegativeY,
      )
      if (negativeY) {
        data0[i] = d.map((v) => -v)
      }
    })

    return data0
  }, [data0])

  let stack
  if (options.stack == 'always') {
    stack = 'total'
  } else if (options.stack == 'none') {
    stack = null
  } else {
    stack = names.length >= 4 ? 'total' : null
  }

  const timeFontSize = 10
  const [interval, rotate] = getTimeInterval(
    width,
    timeline[0],
    timeFontSize,
    timeline.length,
  )

  let showLabel
  if (options.showLabel == 'always') {
    showLabel = true
  } else if (options.showLabel == 'none') {
    showLabel = false
  } else {
    // auto
    showLabel = width / timeline.length > 60 ? true : false
  }

  if (options.axis.scale === 'log') {
    // https://github.com/apache/echarts/issues/9801 log(0) in echarts is invalid
    for (const s of data) {
      s.forEach((v, i) => {
        if (v === 0) {
          s[i] = ''
        }
      })
    }
  }

  const hasNegativeY = panel.overrides.find((o) =>
    o.overrides.find((r) => r.type == BarRules.SeriesNegativeY),
  )
  const hasAxistY = panel.overrides.filter((o) =>
    o.overrides.find((r) => r.type == BarRules.SeriesYAxist),
  )

  const yAxis = [
    {
      id: 0,
      type: options.axis.scale == 'log' ? 'log' : 'value',
      logBase: options.axis.scaleBase,
      scalse: true,
      splitLine: {
        show: options.showGrid,
      },
      show: true,
      splitNumber: options.axis.scale == 'log' ? null : 3,
      axisLabel: {
        fontSize: options.styles.axisFontSize,
        formatter: (value) => {
          let useOverrideUnit = true
          if (value >= 0 || !hasNegativeY) {
            useOverrideUnit = false
          }

          if (
            hasNegativeY &&
            hasAxistY.find((o) => o.target === hasNegativeY.target)
          ) {
            useOverrideUnit = false
          }

          if (!useOverrideUnit) {
            return formatUnit(value, options.value.units, options.value.decimal)
          } else {
            const override = findOverride(panel, hasNegativeY.target)
            const unitOverride = findRuleInOverride(
              override,
              BarRules.SeriesUnit,
            )
            const decimalOverride = findRuleInOverride(
              override,
              BarRules.SeriesDecimal,
            )
            return formatUnit(value, unitOverride?.units, decimalOverride)
          }
        },
      },
    },
  ]

  const usingAxis = {}
  for (const o of hasAxistY) {
    const target = o.target
    if (!rawNames.includes(target)) {
      continue
    }
    const axisID = yAxis.length
    yAxis.push({
      id: axisID,
      position: 'right',
      offset: (axisID - 1) * 40,
      type: options.axis.scale == 'log' ? 'log' : 'value',
      logBase: options.axis.scaleBase,
      scalse: true,
      splitLine: {
        show: false,
      },
      show: true,
      splitNumber: options.axis.scale == 'log' ? null : 3,
      axisLabel: {
        fontSize: options.styles.axisFontSize,
        formatter: (value) => {
          const override = findOverride(panel, target)
          const unitOverride = findRuleInOverride(override, BarRules.SeriesUnit)
          const decimalOverride = findRuleInOverride(
            override,
            BarRules.SeriesDecimal,
          )
          return formatUnit(
            value,
            unitOverride?.units ?? options.value.units,
            decimalOverride ?? options.value.decimal,
          )
        },
      },
    } as any)
    usingAxis[target] = axisID
  }

  const chartOptions = {
    animation: options.animation,
    animationDuration: 500,
    tooltip: {
      show: true,
      trigger:
        options.tooltip == 'none'
          ? 'none'
          : options.tooltip == 'all'
          ? 'axis'
          : 'item',
      appendToBody: true,
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow', // 'shadow' as default; can also be 'line' or 'shadow',
      },
      backgroundColor: useColorModeValue(
        'rgba(255,255,255,0.7)',
        'rgba(255,255,255,0.9)',
      ),
      textStyle: {
        color: useColorModeValue('#444', '#222'),
      },
    },
    grid: {
      left: '1%',
      right: '1%',
      top: '4%',
      bottom: '1%',
      padding: 0,
      containLabel: true,
    },
    [options.axis.swap ? 'yAxis' : 'xAxis']: {
      type: 'category',
      data: timeline,
      show: true,
      axisTick: {
        alignWithLabel: false,
      },
      axisLabel: {
        show: true,
        textStyle: {
          // align: "end"
          // baseline: 'end',
        },
        interval: interval,
        fontSize: options.styles.axisFontSize,
        rotate: options.axis.swap ? 0 : rotate,
      },
    },
    [options.axis.swap ? 'xAxis' : 'yAxis']: yAxis,
    series: names.map((name, i) => {
      const override = findOverride(panel, rawNames[i])

      // console.log("here3333names", name,rawNames[i])
      const fillOverride = findRuleInOverride(override, BarRules.SeriesFill)
      const unitOverride = findRuleInOverride(override, BarRules.SeriesUnit)
      const decimalOverride = findRuleInOverride(
        override,
        BarRules.SeriesDecimal,
      )

      const color = alpha(
        props.data.find((s) => s.name == name)?.color,
        (fillOverride ?? options.styles.barOpacity) / 100,
      )

      let units = options.value.units
      let decimal = options.value.decimal

      if (unitOverride) {
        units = unitOverride.units
      }
      if (decimalOverride) {
        decimal = decimalOverride
      }

      return {
        name: name,
        [options.axis.swap ? 'xAxisIndex' : 'yAxisIndex']:
          usingAxis[rawNames[i]] ?? 0,
        data: data[i],
        type: 'bar',
        stack: stack,
        label: {
          show: showLabel,
          formatter: (v) => {
            const value = formatUnit(v.data, units, decimal)
            if (options.showLabel == 'always') {
              return value
            }

            return Math.abs(v.data) / max >= 0.2 ? value : ''
          },
          fontSize: options.styles.labelFontSize,
          color: getTextColorForAlphaBackground(color, colorMode == 'dark'),
        },
        emphasis: {
          // focus: 'series'
        },
        color: color,
        barWidth:
          stack == 'total'
            ? `${options.styles.barWidth}%`
            : `${options.styles.barWidth / names.length}%`,
        tooltip: {
          valueFormatter: (value) => {
            return formatUnit(value, units, decimal)
          },
        },
      }
    }),
  }

  if (options.thresholdsDisplay != ThresholdDisplay.None) {
    for (const threshold of options.thresholds.thresholds) {
      if (threshold.value == null) {
        continue
      }
      chartOptions.series.push({
        type: 'line',
        symbol: 'none',
        tooltip: {
          show: false,
        },
        // [options.axis.swap ? "xAxisIndex" : "yAxisIndex"]: 0,
        markLine: {
          [options.axis.swap ? 'xAxisIndex' : 'yAxisIndex']: 0,
          silent: true,
          symbol: [options.thresholdArrow, null],
          label: {
            show: false,
          },

          data: [
            {
              [options.axis.swap ? 'xAxis' : 'yAxis']:
                options.thresholds.mode == ThresholdsMode.Absolute
                  ? threshold.value
                  : (threshold.value * max) / 100,
              lineStyle: {
                type:
                  options.thresholdsDisplay == ThresholdDisplay.Line
                    ? 'solid'
                    : 'dashed',
                color: paletteColorNameToHex(threshold.color, colorMode),
                width: 1,
              },
            },
          ],
        },
      } as any)
    }
  }

  for (const o of panel.overrides) {
    const to = o.overrides.find((r) => r.type == BarRules.SeriesThresholds)
    if (to && to.value) {
      const target = o.target

      const mode = to.value.mode
      let i = rawNames.indexOf(target)
      const d = data[i]
      if (!d) {
        continue
      }
      const negativeY = findOverrideRule(
        panel,
        target,
        BarRules.SeriesNegativeY,
      )
      let max
      if (negativeY) {
        max = Math.min(...d)
      } else {
        max = Math.max(...d)
      }
      const separateY = findOverrideRule(panel, target, BarRules.SeriesYAxist)
      for (const threshold of to.value.thresholds) {
        if (threshold.value == null) {
          continue
        }
        chartOptions.series.push({
          [options.axis.swap ? 'xAxisIndex' : 'yAxisIndex']:
            usingAxis[target] ?? 0,
          type: 'line',
          symbol: 'none',
          tooltip: {
            show: false,
          },
          markLine: {
            silent: true,
            symbol:
              separateY === null
                ? [null, options.thresholdArrow]
                : [options.thresholdArrow, null],
            label: {
              show: false,
            },

            data: [
              {
                [options.axis.swap ? 'xAxis' : 'yAxis']:
                  mode == ThresholdsMode.Absolute
                    ? negativeY
                      ? -threshold.value
                      : threshold.value
                    : (threshold.value * max) / 100,
                lineStyle: {
                  type:
                    options.thresholdsDisplay == ThresholdDisplay.Line
                      ? 'solid'
                      : 'dashed',
                  color: paletteColorNameToHex(threshold.color, colorMode),
                  width: 1,
                },
              },
            ],
          },
        } as any)
      }
    }
  }

  const onEvents = genDynamicFunction(panel.plugins.bar.onClickEvent)

  return (
    <>
      <ChartComponent
        key={colorMode}
        options={chartOptions}
        theme={colorMode}
        onChartCreated={(c) => setChart(c)}
        width={width}
        onChartEvents={
          panel.plugins.bar.enableClick
            ? (row) => commonInteractionEvent(onEvents, row)
            : null
        }
        clearWhenSetOption
      />
    </>
  )
})

export default BarChart

const getTimeInterval = (width, format, fontSize, ticks) => {
  const formatWidth = measureText(format, fontSize).width + 10
  const allowTicks = floor(width / formatWidth)
  // console.log("here333333:",ticks, allowTicks, ticks / allowTicks)
  // if ((ticks / allowTicks) > 6) {
  //     return [null, 0]
  // }

  // if ((ticks / allowTicks) > 2.5) {
  //     return [null, 0]
  // }

  // if ((ticks / allowTicks) > 2) {
  //     return [1, 0]
  // }

  return [null, 0]
}
