import { Box, useColorMode } from "@chakra-ui/react";
import GaugeChartComponent from "components/charts/GaugeChart";
import PieChartComponent from "components/charts/PieChart";
import { useEffect, useState } from "react";
import { PanelProps } from "types/dashboard"
import { PiePluginData } from "types/plugins/pie"

interface Props extends PanelProps {
    data: PiePluginData[]
}

const GaugePanel = ({panel, data, height,width}:Props) => {
    const [chart, setChart] = useState(null)
    const {colorMode} = useColorMode()
    const options = {
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
            distance: 50,
            fontSize: 18,
            show: false
          },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: 'inherit'
          },
          data: [
            {
              value: 70
            }
          ]
        }
      ]
    };
    
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
    },[chart])
   

      return (<>
        {options && <Box height={height} key={colorMode} className="echarts-panel"><GaugeChartComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={c => setChart(c)} onChartEvents={null} /></Box>}
    </>)
}

export default GaugePanel

const PieChart = () => {
    
}