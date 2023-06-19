import { Box, useColorMode } from "@chakra-ui/react"
import { ColorModeSwitcher } from "components/ColorModeSwitcher";
import * as echarts from 'echarts';
import { ECharts } from "echarts"
import { useEffect, useRef, useState } from "react"
const TestPage = () => {
   const [options, setOptions] = useState(null)

   useEffect(() => {
      setOptions({
        title: {
          text: 'ECharts 入门示例'
        },
        tooltip: {},
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      })
   },[])


  const { colorMode } = useColorMode()

  console.log("options",options)
  return (<>
    {options && <Box height="400px" width="600px" key={colorMode}><EchartsPanel options={options} theme={colorMode} /></Box>}
    <ColorModeSwitcher />
  </>)
}

export default TestPage


interface Props {
  options: any
  theme: string
}
const EchartsPanel = ({ options, theme }: Props) => {
  const container = useRef(null)
  const [chart, setChart] = useState<ECharts>(null)


  useEffect(() => {
    if (container.current) {
      const c = echarts.init(container.current, theme)
      setChart(c)
      c.setOption(options)
      console.log("create echart instance:",c)
    }

    return () => {
      if (chart) {
        console.log("destroy chart")
        chart?.dispose()
        chart?.clear()
      }
    }
  }, [])

  useEffect(() => {
    if (chart) {
      chart.clear()
      chart.setOption(options)
    }

    console.log("set options :",chart,options)
  }, [options])


  return (<Box ref={container} height="100%" />)
}
