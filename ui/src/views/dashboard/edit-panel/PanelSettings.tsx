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
import { Box, Center, Image, SimpleGrid, Switch, Text, useColorModeValue, Wrap, WrapItem } from "@chakra-ui/react"
import { upperFirst } from "lodash"
import { Panel, PanelEditorProps, PanelTypeRow } from "types/dashboard"
import PanelAccordion from "./Accordion"
import { EditorInputItem } from "../../../components/editor/EditorItem"
import PanelEditItem from "./PanelEditItem"
import { memo, useEffect } from "react"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, panelMsg } from "src/i18n/locales/en"
import { CodeEditorModal } from "src/components/CodeEditor/CodeEditorModal"
import { $config } from "src/data/configs/config"
import { isEmpty } from "utils/validate"
import { builtinPanelPlugins } from "../plugins/built-in/plugins"
import { externalPanelPlugins } from "../plugins/external/plugins"
import { initTimeRange } from "components/DatePicker/TimePicker"
import DatePicker from "../components/PanelDatePicker"
import customColors from "theme/colors"

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
            const plugin = builtinPanelPlugins[type] ?? externalPanelPlugins[type]
            tempPanel.plugins = {
                [type]: pluginsCachedInEdit[type] ?? plugin.settings.initOptions ?? {}
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
    const externalPlugins = Object.keys(externalPanelPlugins).filter(panelType => !disabledPanels?.includes(panelType))
    const builtinPlugins = Object.keys(builtinPanelPlugins).filter(panelType => !disabledPanels?.includes(panelType))
    const isExternalPanel = !isEmpty(externalPlugins.find(panelType => panelType == panel.type))
    const isBuiltin = !isExternalPanel && !panel.type.startsWith("datav")
    const isDatav = !isExternalPanel && panel.type.startsWith("datav")
    return (
        <>
            <PanelAccordion title={t.basicSetting} spacing={2} defaultOpen={false}>
                <PanelEditItem title={t1.panelTitle}>
                    <EditorInputItem value={panel.title} onChange={v => onChange((tempPanel: Panel) => { tempPanel.title = v })} />
                </PanelEditItem>
                <PanelEditItem title={t.description} desc={t1.panelDesc}>
                    <EditorInputItem type="textarea" size="sm" value={panel.desc} onChange={v => onChange((tempPanel: Panel) => { tempPanel.desc = v })} />
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
                                <EditorInputItem value={panel.conditionRender.value} placeholder="e.g varNameA=value1, value1 can be regex" onChange={v => onChange((panel: Panel) => {
                                    panel.conditionRender.value = v
                                })} /> :
                                <CodeEditorModal value={panel.conditionRender.value} onChange={v => onChange((panel: Panel) => {
                                    panel.conditionRender.value = v
                                })} />
                            }
                        </PanelEditItem>
                    </>
                }
                <PanelEditItem title="Enable scope timerange" desc="panel scope timerange will override the global timerange which shows in dashboard header">
                    <Switch isChecked={panel.enableScopeTime} onChange={e => onChange((tempPanel: Panel) => {
                        const v = e.currentTarget.checked
                        tempPanel.enableScopeTime = v
                        if (v && tempPanel.scopeTime == null) {
                            tempPanel.scopeTime = initTimeRange
                        }
                    })} />
                </PanelEditItem>
                {
                    panel.enableScopeTime && <>
                        <PanelEditItem title="Panel timerange">
                            <DatePicker id={panel.id.toString()} timeRange={panel.scopeTime} onChange={tr => onChange((tempPanel: Panel) => {
                                tempPanel.scopeTime = tr
                            })} />
                        </PanelEditItem>
                    </>
                }
            </PanelAccordion>

            {/* panel visulization choosing */}
            <PanelAccordion title={t1.panelType +  ` -> ${isExternalPanel ? t1.externalPanels : (isBuiltin ? t1.visualization : t1.datavPanels)} -> ${panel.type}`} defaultOpen={false} spacing={0}>
                <PanelAccordion title={t1.visualization} defaultOpen={isBuiltin}>
                    <Wrap>
                        {
                            builtinPlugins.map((panelType) => {
                                if (panelType.startsWith("datav")) {
                                    return <></>
                                }
                                const plugin = builtinPanelPlugins[panelType]
                                if (panelType == PanelTypeRow) {
                                    return <></>
                                }
                                return <VisulizationItem
                                    selected={panel.type == panelType}
                                    title={upperFirst(panelType)}
                                    imageUrl={plugin?.settings.icon}
                                    onClick={() => onChangeVisualization(panelType)}
                                />
                            })
                        }
                    </Wrap>
                </PanelAccordion>
                {
                    externalPlugins.length > 0 && <PanelAccordion title={t1.externalPanels} defaultOpen={isExternalPanel}>
                        <Wrap>
                            {
                                externalPlugins.map((panelType) => {
                                    const plugin = externalPanelPlugins[panelType]
                                    return <VisulizationItem
                                        selected={panel.type == panelType}
                                        title={upperFirst(panelType)}
                                        imageUrl={plugin?.settings.icon}
                                        onClick={() => onChangeVisualization(panelType)}
                                    />
                                })
                            }
                        </Wrap>
                    </PanelAccordion>
                }
                <PanelAccordion title={t1.datavPanels} defaultOpen={isDatav}>
                    <Wrap>
                        {
                            builtinPlugins.map((panelType) => {
                                if (panelType.startsWith("datav")) {
                                    const plugin = builtinPanelPlugins[panelType]
                                    return <VisulizationItem
                                        selected={panel.type == panelType}
                                        title={upperFirst(panelType)}
                                        imageUrl={plugin?.settings.icon}
                                        onClick={() => onChangeVisualization(panelType)}
                                    />
                                }

                            })
                        }
                    </Wrap>
                </PanelAccordion>
            </PanelAccordion>
        </>
    )
})

export default PanelSettings


const VisulizationItem = ({ title, imageUrl, onClick = null, selected = false }) => {
    return (
        <Box className={`tag-bg`} border={`3px solid ${selected ? useColorModeValue(customColors.colorBorder.dark, `var(--chakra-colors-brand-400)`) : 'transparent'}`} onClick={onClick} pb="2" cursor="pointer">
            <Center >
                <Text>{title}</Text>
            </Center>
            <Image src={imageUrl} height="50px" width="90px" />
        </Box>

    )
}


