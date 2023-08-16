import { isNaN } from "lodash";
import { Dashboard, DashboardLayout } from "types/dashboard";
import { PanelBorderType, PanelDecorationType } from "types/panel/styles";
import { globalTeamId } from "types/teams";
import { isEmpty } from "utils/validate";

export const HomeDashboardId = "d-home"
export const AlertDashbordId = "d-alert"

export const initDashboard = (team?): Dashboard => {
    return {
        id: "",
        title: "New dashboard",
        tags: [],
        data: {
            panels: [],
            variables: [],
            sharedTooltip: false,
            editable: true,
            hidingVars: "",
            description: "",
            styles: {
                bg: "url(/public/dashboard-bg.png)",
                bgEnabled: false,
                border: PanelBorderType.None,
                // decoration: {
                //     type: PanelDecorationType.None,
                //     width: '100%',
                //     height: "20px",
                //     top: '-30px',
                //     left: '',
                //     justifyContent: "center",
                //     reverse: false
                // },
            },
            layout: DashboardLayout.Vertical,
            allowPanelsOverlap: false,
            enableUnsavePrompt: true,
            enableAutoSave: false,
            autoSaveInterval: 120,
            lazyLoading: true,
            hiddenPanels: []
        },
        ownedBy: (team == 0 || isNaN(team)) ? globalTeamId :  team ,
    }
}

