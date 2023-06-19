import { PanelType } from "types/dashboard";
import { PanelPlugins } from "types/panel/plugins";

export const onClickCommonEvent= "// setVariable: (varName:string, varValue:string) => void \nfunction onClick(item, router, setVariable) {\n\tconsole.log(item)\n}"

//@needs-update-when-add-new-panel
export const initPanelPlugins: PanelPlugins = {
    [PanelType.Graph]: {
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

    [PanelType.Text]:  {
        disableDatasource: true,
        md: `#Welcome to Starship\n This is a new panel\n You can edit it by clicking the edit button on the top title\n ###Have fun!`,
        justifyContent: "left",
        alignItems: "top",
        fontSize: '1.2rem',
        fontWeight: '500',
    },

    [PanelType.Table]: {
        showHeader: true,
        globalSearch:false,
        enablePagination:false,
        pageSize: 10,
        enableFilter: true,
        enableSort: true,
        onRowClick: onClickCommonEvent
    },

    [PanelType.NodeGraph]: {
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
        },

        legend: {
            enable: true
        },

        layout: {
            nodeStrength: 5000,
            gravity: 60,
        }
    },

    [PanelType.Echarts]: {
        parseOptionsFunc: "// parseOptions return echarts.Options, it is directly used in rendering a echarts chart.\nfunction parseOptions(data) {\n\tconsole.log(data)\n\t//I guess you are using testdata datasource,\n\t//data fetching from testdata is already an echarts option\n\t//so there is no need to parse it\n\tconst options = data\n\treturn data\n}"
    }
}

