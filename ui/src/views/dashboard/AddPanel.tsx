// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Menu, MenuButton, MenuItem, MenuList, useColorModeValue } from "@chakra-ui/react";
import IconButton from "src/components/button/IconButton";
import { PanelAdd } from "src/components/icons/PanelAdd";
import { initPanel, initRowPanel } from "src/data/panel/initPanel";
import { Dashboard, Panel, PanelType } from "types/dashboard";
import React from "react";
import { useStore } from "@nanostores/react";
import { dashboardMsg } from "src/i18n/locales/en";
import { $copiedPanel } from "./store/dashboard";
import { isEmpty } from "utils/validate";

interface Props {
    dashboard: Dashboard
    onChange: any
}

const AddPanel = ({ dashboard, onChange }: Props) => {
    const t1 = useStore(dashboardMsg)
    const copiedPanel = useStore($copiedPanel)


    const getNextPanelId = () => {
        let max = 0;

        for (const panel of dashboard.data.panels) {
            if (panel.id > max) {
                max = panel.id;
            }
        }

        return max + 1;
    }


    const onAddPanel = (isRow) => {
        if (!dashboard.data.panels) {
            dashboard.data.panels = []
        }
        const id = getNextPanelId()
        let newPanel: Panel
        if (isRow) {
            newPanel = initRowPanel(id)
        } else {
           newPanel = initPanel(id)
        }

        // scroll to top after adding panel
        const dashGrid = document.getElementById("dashboard-scroll-top")
        dashGrid.scrollIntoView({ behavior: "smooth", block: "center" })
        // dashGrid.scrollTo(0,0)
        onChange(dashboard => { dashboard.data.panels.unshift(newPanel) })
    }

    const onPastePanel = () => {
        if (copiedPanel) {
            const id = getNextPanelId()
            copiedPanel.id = id
            copiedPanel.gridPos = initPanel().gridPos
            onChange(dashboard => { dashboard.data.panels.unshift(copiedPanel) })
            // scroll to top after adding panel
            const dashGrid = document.getElementById("dashboard-scroll-top")
            dashGrid.scrollIntoView({ behavior: "smooth", block: "center" })
            return
        }
    }

    return (<>
        <Menu>
            <MenuButton>
                <IconButton variant="ghost"><PanelAdd size={28} fill={useColorModeValue("var(--chakra-colors-brand-500)", "var(--chakra-colors-brand-200)")} /></IconButton>
            </MenuButton>
            <MenuList>
                <MenuItem onClick={() => onAddPanel(false)}>{t1.addPanel}</MenuItem>
                <MenuItem onClick={() => onAddPanel(true)}>Add Row</MenuItem>
                <MenuItem onClick={() => { onPastePanel() }} isDisabled={isEmpty(copiedPanel)}>{t1.pastePanel}</MenuItem>
            </MenuList>
        </Menu>
    </>)
}

export default AddPanel