import { Dashboard, Panel, PanelType } from "types/dashboard"
import ReactGridLayout from 'react-grid-layout';
import sizeMe from 'react-sizeme';
import { GRID_CELL_HEIGHT, GRID_CELL_VMARGIN, GRID_COLUMN_COUNT } from "src/data/constants";
import { updateGridPos } from "utils/dashboard/panel";
import { Box } from "@chakra-ui/react";
import PanelGrid from "./PanelGrid";
import { memo, useEffect } from "react";
import EditPanel from "../edit-panel/EditPanel";
import uPlot from "uplot";
import { useSearchParam } from "react-use";



interface GridProps {
    dashboard: Dashboard
    onChange: any
}

const DashboardGrid = memo((props: GridProps) => {
    console.log("dashboard grid rendered")
    const edit = useSearchParam('edit')

    const { dashboard, onChange} = props

    const SizedReactLayoutGrid = sizeMe({ monitorWidth: true })(GridWrapper);


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

    const buildLayout = (panels: Panel[]) => {
        const layout = [];

        for (const panel of panels) {
            const stringId = panel.id.toString();

            if (!panel.gridPos) {
                console.log('panel without gridpos');
                continue;
            }

            const panelPos: any = {
                i: stringId,
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

    const onResize = (_layout, _oldItem, newItem) => {
        // console.log(newItem)
        // const panel = dashboard.data.panels[Number(newItem.i) - 1];
        // updateGridPos(panel, newItem);
    }

    const onRemovePanel = (panel: Panel) => {
        const index = dashboard.data.panels.indexOf(panel);
        onChange(dashboard => {
            dashboard.data.panels.splice(index, 1);
        })
    }
    
    let mooSync = dashboard.data.sharedTooltip ? uPlot.sync(dashboard.id) : null


    return (<>
        {/* SizedReactLayoutGrid will force React to rebuild all the panels, so it's not performant here */}
        {!edit && <SizedReactLayoutGrid
            className="layout"
            layout={buildLayout(dashboard.data.panels)}
            isResizable={dashboard.editable}
            isDraggable={dashboard.editable}
            onLayoutChange={onLayoutChange}
            onResize={onResize}
        >
            {
                dashboard.data.panels.map((panel) => {
                    return (<Box key={panel.id} id={`panel-${panel.id}`} sx={{
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
                            width: "8px",
                            height: "8px",
                            borderRight: "2px solid rgba(0, 0, 0, 0.4)",
                            borderBottom: "2px solid rgba(0, 0, 0, 0.4)"
                        }
                    }}>
                       <PanelGrid dashboard={dashboard} panel={panel} onRemovePanel={onRemovePanel}   sync={mooSync} />
                    </Box>)
                })
            }
        </SizedReactLayoutGrid>}
        <EditPanel dashboard={dashboard} onChange={onChange} />
    </>)
})

export default DashboardGrid


interface GridWrapperProps {
    size: { width: number };
    layout: ReactGridLayout.Layout[];
    onLayoutChange: (layout: ReactGridLayout.Layout[]) => void;
    onResize: any
    children: JSX.Element | JSX.Element[];
    className: string;
    isResizable?: boolean;
    isDraggable?: boolean;
}

const GridWrapper = ({
    size,
    layout,
    onLayoutChange,
    onResize,
    children,
    className,
    isResizable,
    isDraggable,
}: GridWrapperProps) => {
    let lastGridWidth = 1000;
    let ignoreNextWidthChange = false;

    const width = size.width > 0 ? size.width : lastGridWidth;

    if (width !== lastGridWidth) {
        if (ignoreNextWidthChange) {
            ignoreNextWidthChange = false;
        } else if (Math.abs(width - lastGridWidth) > 8) {
            lastGridWidth = width;
        }
    }
    /*
      Disable draggable if mobile device, solving an issue with unintentionally
       moving panels.
    */
    const draggable = width <= 420 ? false : isDraggable;

    return (
        //@ts-ignore
        <ReactGridLayout
            width={lastGridWidth}
            autoSize={true}
            className={className}
            isDraggable={draggable}
            isResizable={isResizable}
            containerPadding={[0, 0]}
            useCSSTransforms={false}
            margin={[GRID_CELL_VMARGIN, GRID_CELL_VMARGIN]}
            cols={GRID_COLUMN_COUNT}
            rowHeight={GRID_CELL_HEIGHT}
            draggableHandle=".grid-drag-handle"
            layout={layout}
            onLayoutChange={(v) => onLayoutChange(v)}
            onResize={onResize}
        >
            {children}
        </ReactGridLayout>
    );
}