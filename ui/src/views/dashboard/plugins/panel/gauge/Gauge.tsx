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
import { Box, useColorMode } from "@chakra-ui/react";
import ChartComponent from "components/charts/Chart";
import { cloneDeep, round } from "lodash";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PanelProps } from "types/dashboard"
import { GaugePluginData } from "types/plugins/gauge";
import { SeriesData } from "types/seriesData";
import { calcValueOnSeriesData } from "utils/seriesData";
import React from "react";
import { paletteColorNameToHex } from "utils/colors";

interface Props extends PanelProps {
  data: SeriesData[][]
}

const GaugePanel = (props: Props) => {
  const { panel, height, width } = props
  const [chart, setChart] = useState(null)
  const { colorMode } = useColorMode()

  const data:GaugePluginData[] = useMemo(() => {
    let sd:SeriesData[] = [];
    if (props.data.length > 0) {
        // Gauge only use the first series, Graph use all
        sd.push(props.data[0][0])
    }
    
    const value =  calcValueOnSeriesData(sd[0], props.panel.plugins.gauge.value.calc)
    const name = sd[0].name

    return [{name, value}]
}, [props.data, props.panel.plugins.gauge.value.calc])



  const options = useMemo(() => {
    const split = cloneDeep(panel.plugins.gauge.axis.split)
    for (const s of split) {
      s[1] = paletteColorNameToHex(s[1], colorMode)
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
            show: panel.plugins.gauge.value.show,
            valueAnimation: true,
            formatter: value => `${round(value, panel.plugins.gauge.value.decimal)}${panel.plugins.gauge.value.unit}`,
            // borderColor: 'inherit',
            // borderWidth: 1,
            color: 'inherit',
            fontSize: panel.plugins.gauge.value.fontSize,
            offsetCenter: [panel.plugins.gauge.value.left, panel.plugins.gauge.value.top],
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
            width: 8,
            length: '80%',
            offsetCenter: [0, '8%'],
            itemStyle: {
              color: 'inherit'
            },
          },
          data: data,
          min: panel.plugins.gauge.value.min,
          max: panel.plugins.gauge.value.max,

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
            formatter: value => `${round(value, panel.plugins.gauge.value.decimal)}${panel.plugins.gauge.value.unit}`,
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
  }, [chart,data])


  const onChartCreated = useCallback((chart) => {
    setChart(chart)
  }, [])

  return (<>
    {options && <Box height={height} key={colorMode} className="echarts-panel"><ChartComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={onChartCreated} onChartEvents={null} /></Box>}
  </>)
}

export default GaugePanel
