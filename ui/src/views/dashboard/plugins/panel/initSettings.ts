import { PanelSettings } from "types/dashboard";

export const initPanelSettings:PanelSettings = {
    graph: {
        tooltip: {
            mode: 'all',
            sort: 'desc'
        },
        legend: {
            mode: "table",
            placement: "bottom"
        },
        styles: {
            style: "lines",
            lineWidth: 2,
            fillOpacity: 21,
            showPoints: "never",
            pointSize: 5,
            gradientMode: "opacity"
        },
        axis: {
            showGrid: true,
            scale: "linear",
            scaleBase: 2
        },
        std: {
            unitsType: 'none',
            units: [],
            decimals: 3
        }
    },

    text:  {
        md: `#Welcome to Starship\n This is a new panel\n You can edit it by clicking the edit button on the top title\n ###Have fun!`
    },

    table: {

    },

    nodeGraph: {
        node: {
            baseSize: 36,
            icon: [],
            shape: "donut",
            donutColors: JSON.stringify({
                'success': '#61DDAA',
                'error': '#F08BB4',
            }),
            tooltipTrigger: 'mouseenter',
            menu: []
        }
    }
}