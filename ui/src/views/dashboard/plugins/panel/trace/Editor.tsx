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

import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import { Panel, PanelEditorProps } from "types/dashboard"
import React from "react";
import { useStore } from "@nanostores/react";
import { commonMsg } from "src/i18n/locales/en";
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem";
import { Switch } from "@chakra-ui/react";
import { EditorInputItem } from "src/components/editor/EditorItem";
import { dispatch } from "use-bus";
import { PanelForceRebuildEvent } from "src/data/bus-events";

const TracePanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    return (<PanelAccordion title={t.basic}>
        <PanelEditItem title="Default service">
            <EditorInputItem value={panel.plugins.trace.defaultService} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.trace.defaultService = v
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
        </PanelEditItem>
        <PanelEditItem title="Enable edit service" desc="when diabled, service will be automatically set to default service">
            <Switch isChecked={panel.plugins.trace.enableEditService} onChange={(e) => onChange((panel: Panel) => {
                    panel.plugins.trace.enableEditService = e.target.checked
                    dispatch(PanelForceRebuildEvent + panel.id)
                })} />
        </PanelEditItem>
    </PanelAccordion>
    )
}

export default TracePanelEditor