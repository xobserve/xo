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
import { Box, Center, Image, SimpleGrid, Switch, Text } from "@chakra-ui/react"
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
import { CodeEditorModal } from "src/components/CodeEditor/CodeEditorModal"
import plugins from 'public/plugins/external/panel/plugins.json'
import { $config } from "src/data/configs/config"
import { isEmpty } from "utils/validate"

// in edit mode, we need to cache all the plugins we have edited, until we save the dashboard
let pluginsCachedInEdit = {}
let overridesCacheInEdit = {}
const PanelSettings = memo(({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(panelMsg)
    const onChangeVisualization = type => {
        pluginsCachedInEdit[panel.type] = panel.plugins[panel.type]
        overridesCacheInEdit[panel.type] = panel.overrides
        onChange((tempPanel: Panel) => {
            const oldPlugin = tempPanel.plugins[tempPanel.type]
            tempPanel.type = type
            tempPanel.plugins = {
                [type]: pluginsCachedInEdit[type] ?? initPanelPlugins()[type] ?? {}
            }
            if (oldPlugin.value) {
                tempPanel.plugins[type].value = oldPlugin.value
            }
            tempPanel.overrides = overridesCacheInEdit[type] ?? []
        })
    }

    useEffect(() => {
        return () => {
            pluginsCachedInEdit = {}
            overridesCacheInEdit = {}
        }
    }, [])

    const disabledPanels = $config.get().plugins?.disablePanels
    const externalPanelPlugins = plugins.filter(p => !disabledPanels?.includes(p.type))
    const builtinPanelPlugins = Object.keys(PanelType).filter(k => !disabledPanels?.includes(k))
    const isExternalPanel = !isEmpty(externalPanelPlugins.find(p => p.type == panel.type))
    return (
        <>
            <PanelAccordion title={t.basicSetting} spacing={2} defaultOpen={false}>
                <PanelEditItem title={t1.panelTitle}>
                    <EditorInputItem value={panel.title} onChange={v => onChange((tempPanel: Panel) => { tempPanel.title = v })} />
                </PanelEditItem>
                <PanelEditItem title={t.description} desc={t1.panelDesc}>
                    <EditorInputItem type="textarea" value={panel.desc} onChange={v => onChange((tempPanel: Panel) => { tempPanel.desc = v })} />
                </PanelEditItem>
                <PanelEditItem title={t.transform} desc={t1.enableTransform}>
                    <Switch isChecked={panel.enableTransform} onChange={e => onChange((tempPanel: Panel) => { tempPanel.enableTransform = e.currentTarget.checked })} />
                </PanelEditItem>
                <PanelEditItem title={t1.conditionRender} desc={t1.conditionRenderTips}>
                    <Switch isChecked={panel.enableConditionRender} onChange={e => onChange((tempPanel: Panel) => { tempPanel.enableConditionRender = e.currentTarget.checked })} />
                </PanelEditItem>
                {
                    panel.enableConditionRender && <>
                        {/* <PanelEditItem title={"Condition type"} desc={panel.conditionRender.type == "variable" ? "Ensure the specify variable is set to a given value" : "Check condition in a function, return true or false"}>
                            <RadionButtons options={[{ label: "Variable", value: "variable" }, { label: "Custom", value: "custom" }]} value={panel.conditionRender.type } onChange={v => onChange((panel: Panel) => {
                                panel.conditionRender.type = v
                            })} />
                        </PanelEditItem> */}
                        <PanelEditItem title={t1.condition} desc={panel.conditionRender.type == "variable" ? t1.conditionTips : "Check condition in a function, return true or false"}>
                            {panel.conditionRender.type == "variable" ?
                             <EditorInputItem  value={panel.conditionRender.value} placeholder="e.g varNameA=value1, value1 can be regex"  onChange={v => onChange((panel: Panel) => {
                                panel.conditionRender.value = v
                            })}/> :
                             <CodeEditorModal value={panel.conditionRender.value} onChange={v => onChange((panel: Panel) => {
                                panel.conditionRender.value = v
                            })}/>
                            }
                        </PanelEditItem>
                    </>
                }
            </PanelAccordion>

            {/* panel visulization choosing */}
            <PanelAccordion title={t1.visualization + (!isExternalPanel ? ` -> ${panel.type}` : "")} defaultOpen={false}>
                <SimpleGrid columns={3} spacing="2">
                    {
                        builtinPanelPlugins.map((key) => {
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
            {
                externalPanelPlugins.length > 0 &&  <PanelAccordion  title={t1.externalPanels + (isExternalPanel ? ` -> ${panel.type}` : "")} defaultOpen={false}>
                <SimpleGrid columns={3} spacing="2">
                    {
                        externalPanelPlugins.map((p) => {
                            return <VisulizationItem
                                selected={panel.type == p.type}
                                title={upperFirst(p.type)}
                                imageUrl={`/plugins/external/panel/${p.type}.svg`}
                                onClick={() => onChangeVisualization(p.type)}
                            />
                        })
                    }
                </SimpleGrid>
            </PanelAccordion>
            }
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


