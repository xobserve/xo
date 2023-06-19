import { Dashboard, GridPos, Panel, PanelType } from "types/dashboard"
import RGL, { WidthProvider } from "react-grid-layout";

const ReactGridLayout = WidthProvider(RGL);

import { GRID_CELL_HEIGHT, GRID_CELL_VMARGIN, GRID_COLUMN_COUNT } from "src/data/constants";
import { updateGridPos } from "utils/dashboard/panel";
import { Box, Grid, useColorModeValue } from "@chakra-ui/react";
import React, { CSSProperties, memo, useCallback } from "react";
import EditPanel from "../edit-panel/EditPanel";
import uPlot from "uplot";
import AutoSizer from "react-virtualized-auto-sizer";
import useGranaTheme from 'hooks/useExtraTheme';
import { PanelGrid } from "./PanelGrid";



interface GridProps {
    dashboard: Dashboard
    onChange: any
}

let windowHeight = 1200;
let windowWidth = 1920;

let gridWidth = 0;
const DashboardGrid = memo((props: GridProps) => {
    console.log("dashboard grid rendered:")
    const { dashboard, onChange } = props
    const panelMap = {}


    const buildLayout = () => {
        const layout: ReactGridLayout.Layout[] = [];

        for (const panel of props.dashboard.data.panels) {
            panelMap[panel.id] = panel;

            if (!panel.gridPos) {
                console.log('panel without gridpos');
                continue;
            }

            const panelPos: ReactGridLayout.Layout = {
                i: panel.id.toString(),
                x: panel.gridPos.x,
                y: panel.gridPos.y,
                w: panel.gridPos.w,
                h: panel.gridPos.h,
            };


            if (panel.type === PanelType.Row) {
                panelPos.w = GRID_COLUMN_COUNT;
                panelPos.h = 1;
                panelPos.isResizable = false;
                panelPos.isDraggable = panel.collapsed;
            }

            layout.push(panelPos);
        }

        return layout;
    }

    const onLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
        for (const newPos of newLayout) {
            let p;
            if (p = dashboard.data.panels.find(p => p.id.toString() === newPos.i)) {
                updateGridPos(p, newPos)
            }
        }

        onChange(dashboard => {
            dashboard.data.panels.sort((panelA, panelB) => {
                if (panelA.gridPos.y === panelB.gridPos.y) {
                    return panelA.gridPos.x - panelB.gridPos.x;
                } else {
                    return panelA.gridPos.y - panelB.gridPos.y;
                }
            })
        })
    };

    const onRemovePanel = useCallback((panel: Panel) => {
        const index = dashboard.data.panels.indexOf(panel);
        onChange(dashboard => {
            dashboard.data.panels.splice(index, 1);
        })
    },[dashboard])

    let mooSync = dashboard.data.sharedTooltip ? uPlot.sync(dashboard.id) : null


    const onDragStop = (layout, oldItem, newItem) => {};

    const onResize = (layout, oldItem, newItem) => {};

    const onResizeStop = (layout, oldItem, newItem) => {};

    return (<Box style={{ flex: '1 1 auto' }} id="dashboard-grid" position="relative">
        <AutoSizer disableHeight>
            {({ width }) => {
                if (width === 0) {
                    return null;
                }

                const draggable = width <= 769 ? false : dashboard.editable;

                // This is to avoid layout re-flows, accessing window.innerHeight can trigger re-flow
                // We assume here that if width change height might have changed as well
                if (gridWidth !== width) {
                    windowHeight = window.innerHeight ?? 1000;
                    windowWidth = window.innerWidth;
                    gridWidth = width;
                }

      
                // 621, 524
                return <Box style={{ width: `${width}px`, height: '100%' }} className="grid-layout-wrapper">
                    <ReactGridLayout
                        width={width}
                        isDraggable={draggable}
                        isResizable={dashboard.editable}
                        containerPadding={[0, 0]}
                        useCSSTransforms={false}
                        margin={[GRID_CELL_VMARGIN, GRID_CELL_VMARGIN]}
                        cols={GRID_COLUMN_COUNT}
                        rowHeight={GRID_CELL_HEIGHT}
                        draggableHandle=".grid-drag-handle"
                        draggableCancel=".grid-drag-cancel"
                        layout={buildLayout()}
                        onDragStop={onDragStop}
                        onResize={onResize}
                        onResizeStop={onResizeStop}
                        onLayoutChange={onLayoutChange}
                        compactType="vertical"
                    >
                        {
                            dashboard.data.panels.map((panel) => {
                                return <GridItem
                                    key={panel.id}
                                    data-panelid={panel.id}
                                    gridPos={panel.gridPos}
                                    gridWidth={width}
                                    windowHeight={windowHeight}
                                    windowWidth={windowWidth}
                                >
                                    {(width: number, height: number) => {
                                        return (<Box key={panel.id} id={`panel-${panel.id}`}>
                                            <PanelGrid dashboard={dashboard} panel={panel} width={width} height={height} onRemovePanel={onRemovePanel} sync={mooSync} />
                                        </Box>)
                                    }}
                                </GridItem>

                            })
                        }
                    </ReactGridLayout>
                </Box>
            }}
        </AutoSizer>
        <EditPanel dashboard={dashboard} onChange={onChange} />
    </Box>)
})

export default DashboardGrid


interface GridItemProps extends Record<string, any> {
    gridWidth?: number;
    gridPos?: GridPos;
    isViewing: string;
    windowHeight: number;
    windowWidth: number;
    children: any;
}

/**
 * A hacky way to intercept the react-layout-grid item dimensions and pass them to DashboardPanel
 */
const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>((props, ref) => {
    const theme = useGranaTheme()
    let width = 100;
    let height = 100;

    const { gridWidth, gridPos, isViewing, windowHeight, windowWidth, ...divProps } = props;
    const style: CSSProperties = props.style ?? {};

    if (windowWidth < theme.breakpoints.values.md) {
        // Mobile layout is a bit different, every panel take up full width
        width = props.gridWidth!;
        height = translateGridHeightToScreenHeight(gridPos!.h);
        style.height = height;
        style.width = '100%';
    } else {
        // Normal grid layout. The grid framework passes width and height directly to children as style props.
        width = parseFloat(props.style.width);
        height = parseFloat(props.style.height);
    }

    // props.children[0] is our main children. RGL adds the drag handle at props.children[1]
    return (
        <Box {...divProps} ref={ref} className="react-grid-item" sx={{
            ".react-resizable-handle": {
                position: "absolute",
                width: "20px",
                height: "20px",
                bottom: "0",
                right: "0",
                cursor: "se-resize",
                visibility: "hidden",
            },
            ":hover .react-resizable-handle": {
                visibility: "visible",
            }
            ,
            ".react-resizable-handle::after": {
                content: "''",
                position: "absolute",
                right: "3px",
                bottom: "3px",
                width: "6px",
                height: "6px",
                borderRight: `2px solid ${useColorModeValue('rgba(0, 0, 0, 0.3)', 'rgba(255, 255, 255, 0.4)')}`,
                borderBottom: `2px solid ${useColorModeValue('rgba(0, 0, 0, 0.3)', 'rgba(255, 255, 255, 0.4)')}`
            },
        }}>
            {/* Pass width and height to children as render props */}
            {[props.children[0](width, height), props.children.slice(1)]}
        </Box>
    );
});

/**
* This translates grid height dimensions to real pixels
*/
function translateGridHeightToScreenHeight(gridHeight: number): number {
    return gridHeight * (GRID_CELL_HEIGHT + GRID_CELL_VMARGIN) - GRID_CELL_VMARGIN;
}
