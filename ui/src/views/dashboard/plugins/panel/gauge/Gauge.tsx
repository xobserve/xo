import { Box, useColorMode } from "@chakra-ui/react";
import ChartComponent from "components/charts/Chart";
import { formatUnit } from "components/unit";
import { round } from "lodash";

import { useEffect, useMemo, useState } from "react";
import { PanelProps } from "types/dashboard"
import { GaugePluginData } from "types/plugins/gauge";

interface Props extends PanelProps {
  data: GaugePluginData[]
}

const GaugePanel = ({ panel, data, height, width }: Props) => {
  const [chart, setChart] = useState(null)
  const { colorMode } = useColorMode()
  const options = useMemo(() => {
    return {
      animation: panel.plugins.gauge.animation,
      series: [
        {
          type: 'gauge',
          axisLine: {
            lineStyle: {
              width: 30,
              color: [
                [0.3, '#67e0e3'],
                [0.7, '#37a2da'],
                [1, '#fd666d']
              ]
            }
          },
          pointer: {
            itemStyle: {
              color: 'inherit'
            },
            icon: "pin",
            show: true,
          },
          axisTick: {
            distance: 1100,
            length: 1,
            lineStyle: {
              color: '#red',
              width: 1
            }
          },
   
          detail: {
            valueAnimation: true,
            formatter: value => `${formatUnit(value, panel.plugins.gauge.value.units, panel.plugins.gauge.value.decimals)}`,
            color: 'inherit'
          },
          data: data,
          min: panel.plugins.gauge.value.min,
          max: panel.plugins.gauge.value.max,
          
          /*----scale-----*/
          splitLine: (panel.plugins.gauge.scale.enable && panel.plugins.gauge.scale.splitNumber > 0) ?{
            distance: 12,
            length: 10,
            lineStyle: {
              width: 1
            },
          } : null,
          axisLabel: {
            color: 'inherit',
            distance: 10,
            fontSize: panel.plugins.gauge.scale.fontSize,
            show: panel.plugins.gauge.scale.enable && panel.plugins.gauge.scale.splitNumber > 0
          },
          splitNumber: panel.plugins.gauge.scale.splitNumber
            /*------------*/
        }
      ]
    }
  }, [panel.plugins.gauge, data])

  useEffect(() => {
    let h;
    if (chart) {
      h = setInterval(function () {
        chart.setOption({
          series: [
            {
              data: [
                {
                  value: +(Math.random() * 100).toFixed(2)
                }
              ]
            }
          ]
        });
      }, 2000);
    }

    return () => {
      clearInterval(h)
    }
  }, [chart])


  return (<>
    {options && <Box height={height} key={colorMode} className="echarts-panel"><ChartComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={c => setChart(c)} onChartEvents={null} /></Box>}
  </>)
}

export default GaugePanel
