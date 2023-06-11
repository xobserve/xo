import G6 from "@antv/g6";
import { upperFirst } from "lodash";

export const initLegend = (donutColors) => {
    const legendData = {
        nodes: []
    }

    Object.keys(donutColors).map((key,i) => {

        legendData.nodes.push({
            id: key,
            label: upperFirst(key),
            order: i,
            style: {
                fill: donutColors[key],
            }
        })
    })

    const legend = new G6.Legend({
        data: legendData,
        align: 'center',
        layout: 'horizontal', // vertical
        position: 'bottom-left',
      
        padding: [1, 10, 1, 10],
        containerStyle: {
            fill: 'rgba(255,255,255,0.2)',
            lineWidth: 0,
        },
        title: ' ',
        titleConfig: {
            offsetY: -8,
        },
    });

    return legend
}