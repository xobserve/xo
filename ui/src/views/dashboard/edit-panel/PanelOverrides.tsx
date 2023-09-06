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
import { Box, Button, HStack, StackDivider, Select as ChakraSelect, Tooltip, VStack, useMediaQuery } from "@chakra-ui/react";
import { Form, FormSection } from "src/components/form/Form";
import FormItem from "src/components/form/Item";
import { flatten, isArray } from "lodash";
import { useMemo } from "react";
import { FaTimes } from "react-icons/fa";
import { Panel, PanelEditorProps, PanelType } from "types/dashboard";
import GraphOverridesEditor from "../plugins/panel/graph/OverridesEditor";
import React from "react";
import { useStore } from "@nanostores/react";
import { panelMsg } from "src/i18n/locales/en";
import TableOverridesEditor from "../plugins/panel/table/OverridesEditor";
import BarGaugeOverridesEditor from "../plugins/panel/barGauge/OverrideEditor";
import { getPanelOverridesRules } from "utils/dashboard/panel";
import { SeriesData } from "types/seriesData";
import StatOverridesEditor from "../plugins/panel/stat/OverridesEditor";
import GeomapOverridesEditor from "../plugins/panel/geomap/OverridesEditor";
import { Select } from "antd";
import BarOverridesEditor from "../plugins/panel/bar/OverridesEditor";
import { dispatch } from "use-bus";
import { PanelForceRebuildEvent } from "src/data/bus-events";
import { MobileBreakpoint } from "src/data/constants";

const PanelOverrides = ({ panel, onChange, data }: PanelEditorProps) => {
    const t1 = useStore(panelMsg)

    const overrides = panel.overrides
    const names: { label: string; value: string }[] = useMemo(() => {
        switch (panel.type) {
            case PanelType.Table:
                const res = []
                const d: SeriesData[] = flatten(data)
                if (d.length > 0) {
                    if (isArray(d[0].fields)) {
                        for (const f of d[0].fields) {
                            res.push({
                                label: f.name,
                                value: f.name
                            })
                        }
                    }
                }
                return res


            default:
                return flatten(data)?.map((s: any) => {
                    return {
                        label: s.name,
                        value: s.name
                    }
                })
        }

    }, [data])



    const allRules = getPanelOverridesRules(panel.type)

    const onAddOverride = () => {
        const o = {
            target: names[0].value,
            overrides: []
        }
        onChange((panel: Panel) => {
            panel.overrides.push(o)
        })
    }

    const onAddRule = (i) => {
        onChange((tempPanel: Panel) => {
            const r = allRules.find(r0 => !panel.overrides[i].overrides.some(o => o.type == r0))
            tempPanel.overrides[i].overrides.push({
                type: r,
                value: null
            })
        })
    }

    const removeOverride = i => {
        onChange((panel: Panel) => {
            panel.overrides.splice(i, 1)
        })
    }

    const removeRule = (i, j) => {
        onChange((panel: Panel) => {
            panel.overrides[i].overrides.splice(j, 1)
        })
        
        dispatch(PanelForceRebuildEvent + panel.id)
    }

    const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
    return (<Form p="2">
        {
            overrides.map((o, i) =>
                <FormSection key={o.target + i} title={t1.overrides + (i + 1)} p="1" titleSize="0.9rem" position="relative" bordered>
                    <Box position="absolute" right="2" top="9px" cursor="pointer" onClick={() => removeOverride(i)}><FaTimes fontSize="0.8rem" /></Box>
                    <FormItem title={t1.targetName} alignItems="center">
                        <Select style={{ minWidth: isLargeScreen ? '150px' : '100px' }} showSearch size="large" value={o.target} onChange={v => {
                            onChange((panel: Panel) => {
                                const o = panel.overrides[i]
                                o.target = v
                            })
                        }} options={names.map((name, i) => ({ value: name.value, label: name.label }))} popupMatchSelectWidth={false} />
                    </FormItem>

                    <VStack alignItems="left" pl="6" divider={<StackDivider />} spacing={3}>
                        {o.overrides.length > 0 && o.overrides.map((rule, j) => <FormSection key={rule.type + j} title={`Rule ${j + 1}`} width="fit-content" titleSize="0.9rem" position="relative">

                            <FormItem title="type" size="sm">
                                <ChakraSelect size="sm" value={rule.type} onChange={e => {
                                    const v = e.currentTarget.value
                                    onChange((panel: Panel) => {
                                        panel.overrides[i].overrides[j].type = v
                                    })
                                }}>
                                    {allRules.map(r => {
                                        return <option key={r} value={r}>{r}</option>
                                    })}
                                </ChakraSelect>
                            </FormItem>
                            {/* @needs-update-when-add-new-panel-overrides */}
                            {
                                panel.type == PanelType.Graph && <GraphOverridesEditor  override={rule} onChange={(v) => {
                                    onChange((panel: Panel) => {
                                        panel.overrides[i].overrides[j].value = v
                                    })
                                }} panel={panel}/>
                            }
                            {
                                panel.type == PanelType.Table && <TableOverridesEditor panel={panel} override={rule} onChange={(v) => {
                                    onChange((panel: Panel) => {
                                        panel.overrides[i].overrides[j].value = v
                                    })
                                }} />
                            }
                            {
                                panel.type == PanelType.BarGauge && <BarGaugeOverridesEditor override={rule} onChange={(v) => {
                                    onChange((panel: Panel) => {
                                        panel.overrides[i].overrides[j].value = v
                                    })
                                }} />
                            }
                            {
                                panel.type == PanelType.Stat && <StatOverridesEditor override={rule} onChange={(v) => {
                                    onChange((panel: Panel) => {
                                        panel.overrides[i].overrides[j].value = v
                                    })
                                }} />
                            }
                            {
                                panel.type == PanelType.GeoMap && <GeomapOverridesEditor override={rule} onChange={(v) => {
                                    onChange((panel: Panel) => {
                                        panel.overrides[i].overrides[j].value = v
                                    })
                                }} />
                            }
                            {
                                panel.type == PanelType.Bar && <BarOverridesEditor override={rule} onChange={(v) => {
                                    onChange((panel: Panel) => {
                                        panel.overrides[i].overrides[j].value = v
                                    })
                                }} />
                            }
                            <Box position="absolute" right="1" top="5px" cursor="pointer" onClick={() => removeRule(i, j)}><FaTimes fontSize="0.8rem" /></Box>
                        </FormSection>
                        )}
                    </VStack>

                    <Button size="sm" variant="ghost" onClick={() => onAddRule(i)}>{t1.addRule}</Button>
                </FormSection>)
        }
        {allRules.length > 0 && <Button width="100%" variant="outline" onClick={onAddOverride}>{t1.addOverride}</Button>}
    </Form>)
}

export default PanelOverrides