import { Box } from "@chakra-ui/react"
import BarGauge from "components/BarGauge"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"
import React from "react"
import { ThresholdsConfig, ThresholdsMode } from "types/threshold"
import { colors } from "utils/colors"
import { measureText } from "utils/measureText"

const TestPage = () => {
    const data = [
        {
            title: "aa",
            value: 400,
            max: 1000,
            color: colors[0],
            text: '400ms'
        },
        {
            title: "bb",
            value: 1000,
            max: 1000,
            color: colors[0],
            text: '1000ms'
        },
        {
            title: "cc",
            value: 700,
            max: 1000,
            color: colors[0],
            text: '700ms'
        },
    ]

    const thresholds: ThresholdsConfig = {
        mode: ThresholdsMode.Percentage,
        thresholds: [
            {
                value: 80,
                color: colors[4]
            },
            {
                value: 70, 
                color: colors[3]
            },
            {
                value: null,
                color: colors[0]
            }
        ]
    }

    const textSize = 40
    let textWidth= 0 
    for (const v of data) {
        const m = measureText(v.text, textSize)
        if (m.width > textWidth) {
            textWidth = m.width
        }
    }
    return (<Box>
        <Box width="400px" height="300px" mt="4" ml="4">
            <BarGauge data={data} textSize={textSize} threshods={thresholds} textWidth={textWidth} width={400} height={300} />
        </Box>
        <ColorModeSwitcher miniMode />
    </Box>)
}

export default TestPage