import { Dashboard } from "types/dashboard";

export const sortPanelsByGridPos = (dashboard: Dashboard) => {
    dashboard.data.panels.sort((panelA, panelB) => {
        if (panelA.gridPos.y === panelB.gridPos.y) {
            return panelA.gridPos.x - panelB.gridPos.x;
        } else {
            return panelA.gridPos.y - panelB.gridPos.y;
        }
    });
}