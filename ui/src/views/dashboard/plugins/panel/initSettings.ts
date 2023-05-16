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
        showHeader: true,
        globalSearch:false,
        enablePagination:false,
        pageSize: 10,
        enableFilter: true,
        enableSort: true,
        onRowClick: ''
    },

    nodeGraph: {
        node: {
            baseSize: 36,
            maxSize: 1.5,
            icon: [],
            shape: "donut",
            donutColors: JSON.stringify({
                'success': '#61DDAA',
                'error': '#F08BB4',
            }),
            tooltipTrigger: 'mouseenter',
            menu: []
        },

        edge: {
            shape: 'quadratic',
            arrow: 'default',
            color: {
                light: '#ddd', 
                dark: "#8CA88C",
            },
            opacity: 0.6,
            highlightColor: {
                light: '#E0D731',
                dark: '#00B5D8'
            }
        }
    }
}
