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
import { EditorInputItem } from "src/components/editor/EditorItem"
import RadionButtons from "src/components/RadioButtons"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import React, { memo } from "react";
import { useStore } from "@nanostores/react"
import { PanelType, DatavTraceEditorProps, DatavTracePanel as Panel } from "./types"
import CodeEditor from "components/CodeEditor/CodeEditor"
import { locale } from "src/i18n/i18n";

const TextPanelEditor = memo(({ panel, onChange }: DatavTraceEditorProps) => {
    const lang = useStore(locale)
    return (<PanelAccordion title={lang == "en" ? "Trace basic settings" : "Trace 基本设置"}>
        
    </PanelAccordion>
    )
})

export default TextPanelEditor