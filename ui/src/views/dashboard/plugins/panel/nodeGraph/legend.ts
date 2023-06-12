import G6 from "@antv/g6";
import { donutLightColors } from "./utils";

export const initLegend = () => {
    const legendData = {
        nodes: [{
            id: 'success',
            label: 'Success',
            order: 0,
            style: {
                fill: donutLightColors['success'],
            }
        }, {
            id: 'rror',
            label: 'Error',
            order: 2,
            style: {
                fill: donutLightColors['error'],
            }
        }]
    }

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