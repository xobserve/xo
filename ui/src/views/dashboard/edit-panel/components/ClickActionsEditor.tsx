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

import { Box, Button, HStack, Select, VStack, Wrap, useMediaQuery, useTheme } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import React, { useMemo } from "react"
import { onClickCommonEvent } from "src/data/panel/initPlugins"
import { tablePanelMsg } from "src/i18n/locales/en"
import { Panel } from "types/dashboard"
import { getColorThemeValues } from "utils/theme"
import PanelEditItem from "../PanelEditItem"
import { EditorInputItem } from "src/components/editor/EditorItem"
import { CodeEditorModal } from "src/components/CodeEditor/CodeEditorModal"
import { FaTimes } from "react-icons/fa"
import { MobileBreakpoint } from "src/data/constants"

export interface ClickAction {
    name: string; 
    action: string; 
    style: string; 
    color: string 
}

interface Props {
    panel: Panel
    onChange: any 
    actions: ClickAction[]
}

export const ClickActionsEditor = ({ panel, onChange, actions }) => {
    const t1 = useStore(tablePanelMsg)
    const theme = useTheme()
    const colors = useMemo(() => {
        return getColorThemeValues(theme).map(c => <option key={c} value={c}>{c}</option>)
    }, [theme])

    const addAction = () => {
        onChange([{ name: "New action", action: onClickCommonEvent, style: "solid", color: "brand" }, ...actions])
    }

    const removeAction = (index: number) => {
        onChange(actions.filter((_, i) => i !== index))
    }

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    const Stack = isLargeScreen ? HStack : Wrap
    return (<PanelEditItem title={t1.rowActions} desc={t1.rowActionsTips}>
        <Button size="sm" colorScheme="gray" width="100%" onClick={addAction}>{t1.addAction}</Button>
        <VStack alignItems="left" mt="2" key={actions.length}>
            {
                actions.map((action: ClickAction, index) => <Stack key={index}>
                    <Box width="140px"><EditorInputItem placeholder="Action name" value={action.name} onChange={v => {
                        action.name = v
                        onChange([...actions])
                    }} /></Box>
                    <CodeEditorModal value={action.action} onChange={v => {
                        action.action = v
                        onChange([...actions])
                    }} triggerProps={{size: "sm", variant: action.style, colorScheme: action.color}}/>
                    <Select width="80px" size="sm" variant="unstyled" value={action.style} onChange={e => {
                        action.style = e.target.value
                        onChange([...actions])
                    }}>
                        <option value="solid">Solid</option>
                        <option value="outline">Outline</option>
                        <option value="ghost">Ghost</option>
                    </Select>
                    <Select width="140px" size="sm" variant="unstyled" value={action.color} onChange={e => {
                        action.color = e.target.value
                        onChange([...actions])
                    }}>
                        {colors}
                    </Select>
                    <FaTimes className="action-icon" cursor="pointer" onClick={() => removeAction(index)} />
                </Stack>)
            }
        </VStack>
    </PanelEditItem>)
}