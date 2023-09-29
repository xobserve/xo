// Copyright 2023 Datav.io Team
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
import { Box, Center, useColorMode } from "@chakra-ui/react";
import ChartComponent from "src/components/charts/Chart";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { PanelProps } from "types/dashboard"
import { SeriesData } from "types/seriesData";
import { calcValueOnSeriesData } from "utils/seriesData";
import React from "react";
import { colors, paletteColorNameToHex } from "utils/colors";
import { ValueCalculationType } from "types/value";
import { isEmpty } from "utils/validate";
import { ThresholdsMode } from "types/threshold";
import { replaceWithVariables } from "utils/variable";
import { VariableCurrentValue } from "src/data/variable";
import { formatUnit } from "src/views/dashboard/plugins/components/UnitPicker";
import NoData from "src/views/dashboard/components/PanelNoData";
import {GaugePluginData} from './types'

interface Props extends PanelProps {
  data: SeriesData[][]
}

const GaugePanel = memo((props: Props) => {
  const { panel, height, width } = props
  const [chart, setChart] = useState(null)
  const { colorMode } = useColorMode()

  const data: GaugePluginData[] = useMemo(() => {
    let sd: SeriesData[] = [];
    if (props.data.length > 0) {
      // Gauge only use the first series, Graph use all
      for (const d of props.data) {
        for (const s of d) {
          if (s.name == panel.plugins.gauge.diisplaySeries) {
            sd.push(s)
          }
        }
      }

      if (sd.length == 0) {
        sd.push(props.data[0][0])
      }
    }

    if (sd.length == 0) {
      return []
    }
    const value = calcValueOnSeriesData(sd[0], props.panel.plugins.gauge.value.calc)
    const name = isEmpty(props.panel.plugins.gauge.title.display) ? sd[0].name : replaceWithVariables(props.panel.plugins.gauge.title.display, { [VariableCurrentValue]: sd[0].name })
    const min = panel.plugins.gauge.valueStyle.min ?? calcValueOnSeriesData(sd[0], ValueCalculationType.Min)
    const max = panel.plugins.gauge.valueStyle.max ?? calcValueOnSeriesData(sd[0], ValueCalculationType.Max)
    return [{ name, value, min, max }]
  }, [props.data, props.panel.plugins.gauge.value, props.panel.plugins.gauge.title.display, props.panel.plugins.gauge.diisplaySeries])



  const options = useMemo(() => {
    const thresholds = panel.plugins.gauge.thresholds
    let split = []
    if (isEmpty(thresholds)) {
      split = [[1, colors[0]]]
    } else {
      for (let i = thresholds.thresholds.length - 1; i >= 0; i--) {
        const t = thresholds.thresholds[i]
        if (i == 0) {
          split.push([1, paletteColorNameToHex(t.color, colorMode)])
          continue
        } else {
          const next = thresholds.thresholds[i - 1]
          split.push([thresholds.mode == ThresholdsMode.Percentage ? next.value / 100 : (next.value - (data[0]?.min)??0) / (data[0].max - (data[0]?.min)??0), paletteColorNameToHex(t.color, colorMode)])
        }
      }
    }

    return {
      animation: panel.plugins.gauge.animation,
      grid: {
        left: "0%",
        right: "0%",
        width: "100%",
        padding: 0
      },
      series: [
        {
          type: 'gauge',
          radius: '100%',
          title: {
            show: panel.plugins.gauge.title.show,
            fontSize: panel.plugins.gauge.title.fontSize,
            offsetCenter: [panel.plugins.gauge.title.left, panel.plugins.gauge.title.top],
            color: 'inherit'
          },
          detail: {
            show: panel.plugins.gauge.valueStyle.show,
            valueAnimation: true,
            formatter: value => formatUnit(value, panel.plugins.gauge.value.units, panel.plugins.gauge.value.decimal),
            // borderColor: 'inherit',
            // borderWidth: 1,
            color: 'inherit',
            fontSize: panel.plugins.gauge.valueStyle.fontSize,
            offsetCenter: [panel.plugins.gauge.valueStyle.left, panel.plugins.gauge.valueStyle.top],
            // color: '#fff',
            // backgroundColor: 'inherit',
            // width: 50,
            // height: 14,
            borderRadius: 3,
          },
          axisLine: {
            lineStyle: {
              width: panel.plugins.gauge.axis.width,
              color: split
            }
          },
          axisTick: {
            show: panel.plugins.gauge.axis.showTicks,
            splitNumber: 5,
            length: 6,
            distance: 10
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 18,
            itemStyle: {
              color: '#FAC858'
            }
          },
          pointer: {
            icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
            width: panel.plugins.gauge.pointer.width,
            length: panel.plugins.gauge.pointer.length,
            offsetCenter: [0, '8%'],
            itemStyle: {
              color: 'inherit'
            },
          },
          data: data,
          min: data[0]?.min,
          max: data[0]?.max,

          /*----scale-----*/
          splitLine: (panel.plugins.gauge.scale.enable && panel.plugins.gauge.scale.splitNumber > 0) ? {
            // distance: 12,
            length: 10,
            lineStyle: {
              width: 1
            },
          } : null,
          axisLabel: {
            color: 'inherit',
            distance: 14,
            fontSize: panel.plugins.gauge.scale.fontSize,
            show: panel.plugins.gauge.scale.enable && panel.plugins.gauge.scale.splitNumber > 0,
            formatter: value => formatUnit(value, panel.plugins.gauge.value.units, panel.plugins.gauge.value.decimal),
          },
          splitNumber: panel.plugins.gauge.scale.splitNumber,
          /*------------*/
        }
      ]
    }
  }, [panel.plugins.gauge, colorMode])

  useEffect(() => {
    if (chart) {
      chart.setOption({
        series: [
          {
            data: data
          }
        ]
      });
    }
  }, [chart, data])


  const onChartCreated = useCallback((chart) => {
    setChart(chart)
  }, [])

  return (<>
    {isEmpty(props.data) ? <Center height="100%"><NoData /></Center> : options && <Box height={height} key={colorMode} className="echarts-panel"><ChartComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={onChartCreated} onChartEvents={null} /></Box>}
  </>)
})

export default GaugePanel
