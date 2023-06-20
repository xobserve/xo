import { Box, useColorMode } from "@chakra-ui/react";
import PieChartComponent from "components/charts/PieChart";
import { useState } from "react";
import { PanelProps } from "types/dashboard"
import { PiePluginData } from "types/plugins/pie"

interface Props extends PanelProps {
    data: PiePluginData[]
}

const GaugePanel = ({panel, data, height,width}:Props) => {
    const [chart, setChart] = useState(null)
    const {colorMode} = useColorMode()
    const options = {
        legend: {
          top: 'bottom'
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        series: [
          {
            name: 'Nightingale Chart',
            type: 'pie',
            radius: [50, 250],
            center: ['50%', '50%'],
            roseType: 'area',
            itemStyle: {
              borderRadius: 8
            },
            data: [
              { value: 40, name: 'rose 1' },
              { value: 38, name: 'rose 2' },
              { value: 32, name: 'rose 3' },
              { value: 30, name: 'rose 4' },
              { value: 28, name: 'rose 5' },
              { value: 26, name: 'rose 6' },
              { value: 22, name: 'rose 7' },
              { value: 18, name: 'rose 8' }
            ]
          }
        ]
      };

      return (<>
        {options && <Box height={height} key={colorMode} className="echarts-panel"><PieChartComponent options={options} theme={colorMode} width={width} height={height} onChartCreated={c => setChart(c)} onChartEvents={null} darkBg={null} /></Box>}
    </>)
}

export default GaugePanel

const PieChart = () => {
    
}