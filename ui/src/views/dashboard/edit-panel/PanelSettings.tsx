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
import { Box, Center, Checkbox, Image, Input, SimpleGrid, Switch, Text, Textarea } from "@chakra-ui/react"
import { upperFirst } from "lodash"
import { Panel, PanelEditorProps, PanelType } from "types/dashboard"
import PanelAccordion from "./Accordion"
import { EditorInputItem } from "../../../components/editor/EditorItem"
import PanelEditItem from "./PanelEditItem"
import { initPanelPlugins } from "src/data/panel/initPlugins"
import { memo, useEffect } from "react"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, panelMsg } from "src/i18n/locales/en"

// in edit mode, we need to cache all the plugins we have edited, until we save the dashboard
let pluginsCachedInEdit = {}
let overridesCacheInEdit = {}
const PanelSettings = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(panelMsg)
    const onChangeVisualization = type => {
        pluginsCachedInEdit[panel.type] = panel.plugins[panel.type]
        overridesCacheInEdit[panel.type] = panel.overrides
        onChange((tempPanel:Panel) => {
            tempPanel.type = type
                        
            tempPanel.plugins = {
                [type]: pluginsCachedInEdit[type] ??  initPanelPlugins()[type]
            }

            tempPanel.overrides = overridesCacheInEdit[type] ?? []
        })
    }
    
    useEffect(() => {
        return () => {
            pluginsCachedInEdit = {}
            overridesCacheInEdit= {}
        }
    },[])

    return (
        <>
            <PanelAccordion title={t.basicSetting} defaultOpen>
                <PanelEditItem title={t1.panelTitle}>
                    <EditorInputItem value={panel.title} onChange={v => onChange((tempPanel:Panel) => { tempPanel.title = v })}   />
                </PanelEditItem>
                <PanelEditItem title={t.description} desc={t1.panelDesc}>
                    <EditorInputItem type="textarea" value={panel.desc} onChange={v => onChange((tempPanel:Panel) => { tempPanel.desc = v })}   />
                </PanelEditItem>
                <PanelEditItem title={t.transform} desc={t1.enableTransform}>
                    <Switch isChecked={panel.enableTransform} onChange={e => onChange((tempPanel:Panel) => { tempPanel.enableTransform = e.currentTarget.checked })}  />
                </PanelEditItem>
            </PanelAccordion>

            {/* panel visulization choosing */}
            <PanelAccordion title={t1.visuization} defaultOpen>
                <SimpleGrid columns={3} spacing="2">
                    {
                        Object.keys(PanelType).map((key) => {
                            if (PanelType[key] == PanelType.Row) {
                                return <></>
                            }
                            return <VisulizationItem
                                selected={panel.type == PanelType[key]}
                                title={upperFirst(PanelType[key])}
                                imageUrl={`/plugins/panel/${PanelType[key].toLowerCase()}.svg`}
                                onClick={() => onChangeVisualization(PanelType[key])}
                            />
                        })
                    }
                </SimpleGrid>
            </PanelAccordion>
        </>
    )
})

export default PanelSettings


const VisulizationItem = ({ title, imageUrl, onClick = null, selected = false }) => {
    return (
        <Box className={`tag-bg ${selected ? "highlight-bordered" : ""}`} onClick={onClick} pb="2" cursor="pointer">
            <Center >
                <Text>{title}</Text>
            </Center>
            <Image src={imageUrl} height="70px" width="100%" />
        </Box>

    )
}


