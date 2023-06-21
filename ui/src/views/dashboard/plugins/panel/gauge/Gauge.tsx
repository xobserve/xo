import { Box, useColorMode } from "@chakra-ui/react";
import ChartComponent from "components/charts/Chart";
import { formatUnit } from "components/unit";

import { useEffect, useMemo, useState } from "react";
import { PanelProps } from "types/dashboard"
import { GaugePluginData } from "types/plugins/gauge";

interface Props extends PanelProps {
    data: GaugePluginData[]
}

const GaugePanel = ({panel, data, height,width}:Props) => {
    const [chart, setChart] = useState(null)
    const {colorMode} = useColorMode()
    const options = useMemo(() => {
      return {
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
              }
            },
            axisTick: {
              distance: 0,
              length: 0,
              lineStyle: {
                color: '#fff',
                width: 0
              }
            },
            splitLine: {
              distance: -30,
              length: 0,
              lineStyle: {
                color: '#fff',
                width: 4
              }
            },
            axisLabel: {
              color: 'inherit',
              distance:10,
              fontSize: 14,
              show: true
            },
            detail: {
              valueAnimation: true,
              formatter: value => `${formatUnit(value,panel.plugins.gauge.value.units,panel.plugins.gauge.value.decimals)}`,
              color: 'inherit'
            },
            data: data,
            min: panel.plugins.gauge.value.min,
            max: panel.plugins.gauge.value.max,
            splitNumber: 1
          }
        ]
      }
    },[panel.plugins.gauge, data])
    
    // useEffect(() => {
    //   let h;
    //   if (chart) {
    //     h = setInterval(function () {
    //       chart.setOption({
    //         series: [
    //           {
    //             data: [
    //               {
    //                 value: +(Math.random() * 100).toFixed(2)
    //               }
    //             ]
    //           }
    //         ]
    //       });
    //     }, 10000);
    //   }

    //   return () => {
    //     clearInterval(h)
    //   }
    // },[chart])
   

      return (<>
        {options && <Box height={height} key={colorMode} className="echarts-panel"><ChartComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={c => setChart(c)} onChartEvents={null} /></Box>}
    </>)
}

export default GaugePanel
