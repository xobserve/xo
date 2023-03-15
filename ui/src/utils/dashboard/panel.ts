import { GridPos, Panel } from "types/dashboard";

export const updateGridPos = (panel: Panel,newPos: GridPos) => {
    panel.gridPos.x = newPos.x;
    panel.gridPos.y = newPos.y;
    panel.gridPos.w = newPos.w;
    panel.gridPos.h = newPos.h;
}


