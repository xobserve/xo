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
import { Box, Button, HStack, Select, StackDivider, Tooltip, VStack } from "@chakra-ui/react";
import { Form, FormSection } from "components/form/Form";
import FormItem from "components/form/Item";
import { flatten } from "lodash";
import { useMemo, useState } from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import { Panel, PanelEditorProps, PanelType } from "types/dashboard";
import GraphOverridesEditor, { GraphOverridesRules } from "../plugins/panel/graph/OverridesEditor";
import React from "react";
import { useStore } from "@nanostores/react";
import { commonMsg, panelMsg } from "src/i18n/locales/en";


const PanelOverrides = ({ panel, onChange, data }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(panelMsg)

    const overrides = panel.overrides
    const names = useMemo(() => flatten(data)?.map((s: any) => s.name), [data])

    const getAllRules = ():string[] => {
        switch (panel.type) {
            case PanelType.Graph:
                return GraphOverridesRules
        
            default:
                return []
        }
    }

    const allRules = getAllRules()

    const onAddOverride = () => {
        const o = {
            target: names[0],
            overrides: []
        }
        onChange((panel: Panel) => {
            panel.overrides.push(o)
        })
    }

    const onAddRule = (i) => {
        onChange((panel: Panel) => {
            panel.overrides[i].overrides.push({
                type: allRules[0],
                value: ""
            })
        })
    }

    const removeOverride = i => {
        onChange((panel: Panel) => {
            panel.overrides.splice(i, 1)
        })
    }

    const removeRule = (i,j) => {
        onChange((panel: Panel) => {
            panel.overrides[i].overrides.splice(j, 1)
        })
    }


    return (<Form p="2">
        {
            overrides.map((o, i) => <FormSection title={t1.overrides + (i + 1)} p="1" titleSize="0.9rem" position="relative" bordered>
                <Box position="absolute" right="2" top="9px" cursor="pointer" onClick={() => removeOverride(i)}><FaTimes fontSize="0.8rem" /></Box>
                <FormItem title={t1.targetName} alignItems="center">
                    <Tooltip label={o.target}>
                        <Select value={o.target} onChange={e => {
                            const v = e.currentTarget.value
                            onChange((panel: Panel) => {
                                const o = overrides[i]
                                o.target = v
                            })
                        }}>
                            {
                                names.map((name, i) => <option key={name} value={name}>{name}</option>)
                            }
                        </Select>
                    </Tooltip>
                </FormItem>
                
                <VStack alignItems="left" pl="6" divider={<StackDivider />} spacing={3}>
                {o.overrides.length > 0 && o.overrides.map((rule,j) => <FormSection title={`Rule ${j+1}`} width="fit-content" titleSize="0.9rem" position="relative">

                    <FormItem title="type" size="sm">
                        <Select size="sm" value={rule.type} onChange={e => {
                            const v = e.currentTarget.value
                            onChange((panel: Panel) => {
                                panel.overrides[i].overrides[j].type = v
                            })
                        }}>
                            {allRules.map(r => <option key={r} value={r}>{r}</option>)}
                        </Select>
                    </FormItem>
                    {
                        panel.type == PanelType.Graph && <GraphOverridesEditor override={rule} onChange={(v) => {
                            onChange((panel: Panel) => {
                                panel.overrides[i].overrides[j].value = v
                            })
                        }}/>
                    }
                    <Box position="absolute" right="1" top="5px" cursor="pointer" onClick={() => removeRule(i,j)}><FaTimes fontSize="0.8rem" /></Box>
                </FormSection>
                )}
                </VStack>

                <Button size="sm" variant="ghost" onClick={() => onAddRule(i)}>{t1.addRule}</Button>
            </FormSection>)
        }
        <Button width="100%" variant="outline" onClick={onAddOverride}>{t1.addOverride}</Button>
    </Form>)
}

export default PanelOverrides