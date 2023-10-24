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
import { Box, HStack, Select, Switch, VStack, useColorModeValue } from "@chakra-ui/react"
import { ColorPicker } from "src/components/ColorPicker"
import { Panel, PanelEditorProps } from "types/dashboard"
import { PanelBorderType, PanelTitleDecorationType } from "types/panel/styles"
import PanelAccordion from "./Accordion"
import { EditorInputItem, EditorNumberItem } from "../../../components/editor/EditorItem"
import PanelEditItem from "./PanelEditItem"
import DecorationSelect from "src/components/largescreen/components/DecorationSelect"
import BorderSelect from "src/components/largescreen/components/BorderSelect"
import RadionButtons from "src/components/RadioButtons"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, panelMsg } from "src/i18n/locales/en"
import { paletteColorNameToHex, paletteMap } from "utils/colors"

const PanelStyles = ({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(panelMsg)
    // let usePalette = false 
    // switch (panel.type) {
    //     case PanelType.Bar:
    //     case PanelType.Graph:
    //     case PanelType.Echarts:
    //     case PanelType.Pie:
    //         usePalette =true
    //         break;
    //     default:
    //         break;
    // }
    return (
        <>
            {<PanelAccordion title={t.basic} defaultOpen>
                <PanelEditItem title={t.palette} desc={t1.paletteTips}>
                    <VStack spacing={1} alignItems="left">
                        {
                            Object.keys(paletteMap).map(name => <HStack width="fit-content" spacing={0} borderRadius={4} borderWidth={"2px"} borderColor={name != panel.styles.palette ? "transparent" : useColorModeValue("brand.300", "brand.500")} cursor="pointer" onClick={e => {
                                onChange((panel: Panel) => {
                                    panel.styles.palette = name
                                })
                            }} >
                                {
                                    paletteMap[name].map(color => <Box width="15px" height="15px" borderRadius="50%" style={{ backgroundColor: paletteColorNameToHex(color) }} />)
                                }
                            </HStack>)
                        }
                    </VStack>
                </PanelEditItem>
                <PanelEditItem title="width" desc="panel width in dashboard, value range is [1,24], 24 is the same as 100%">
                    <EditorNumberItem min={1} max={24} step={1} value={panel.gridPos.w} onChange={v => onChange(panel => {
                        panel.gridPos.w = v
                    })} />
                </PanelEditItem>
            </PanelAccordion>}
            <PanelAccordion title={t1.panelBorder} defaultOpen>
                <PanelEditItem title={t1.borderType}>
                    <BorderSelect value={panel.styles?.border} onChange={v => {
                        onChange(panel => {
                            panel.styles.border = v
                        })
                    }} />
                </PanelEditItem>
                {panel.styles.border == PanelBorderType.None && <PanelEditItem title={t1.borderOnHover}>
                    <Switch defaultChecked={panel.styles.borderOnHover} onChange={e => {
                        const checked = e.currentTarget.checked
                        onChange(panel => {
                            panel.styles.borderOnHover = checked
                        })
                    }} />
                </PanelEditItem>}

                <PanelEditItem title="Width reduction" desc="reduce panel width">
                    <EditorNumberItem min={0} max={1000} step={1} value={panel.styles.widthReduction} onChange={v => onChange(panel => {
                        panel.styles.widthReduction = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Height reduction" desc="reduce panel height">
                    <EditorNumberItem min={0} max={1000} step={1} value={panel.styles.heightReduction} onChange={v => onChange(panel => {
                        panel.styles.heightReduction = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Margin left">
                    <EditorNumberItem min={0} max={1000} step={1} value={panel.styles.marginLeft} onChange={v => onChange(panel => {
                        panel.styles.marginLeft = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Margin top">
                    <EditorNumberItem min={0} max={1000} step={1} value={panel.styles.marginTop} onChange={v => onChange(panel => {
                        panel.styles.marginTop = v
                    })} />
                </PanelEditItem>
            </PanelAccordion>
            <PanelAccordion title={t1.titleDecoration}>
                <PanelEditItem title="type">
                    <Select size="sm" value={panel.styles?.title?.decoration.type} onChange={e => {
                        const v = e.currentTarget.value
                        onChange(panel => {
                            panel.styles.title.decoration.type = v
                        })
                    }}>
                        {
                            Object.keys(PanelTitleDecorationType).map(key => <option value={PanelTitleDecorationType[key]}>{key}</option>)
                        }
                    </Select>
                </PanelEditItem>
                <PanelEditItem title="width">
                    <EditorInputItem type="input" value={panel.styles.title?.decoration.width} onChange={v => onChange(panel => {
                        panel.styles.title.decoration.width = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="height">
                    <EditorInputItem type="input" value={panel.styles.title?.decoration.height} onChange={v => onChange(panel => {
                        panel.styles.title.decoration.height = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="margin">
                    <EditorInputItem type="input" value={panel.styles.title?.decoration.margin} onChange={v => onChange(panel => {
                        panel.styles.title.decoration.margin = v
                    })} />
                </PanelEditItem>
                {/* <NumberInputItem target={panel.styles.title?.decoration} attr="width" onChange={onChange} title="width" min={0} max={100} /> */}
            </PanelAccordion>

            <PanelAccordion title={t1.titleStyles}>
                <PanelEditItem title="font size">
                    <EditorInputItem type="input" value={panel.styles.title?.fontSize} onChange={v => onChange(panel => {
                        panel.styles.title.fontSize = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="font weight">
                    <EditorInputItem type="input" value={panel.styles.title?.fontWeight} onChange={v => onChange(panel => {
                        panel.styles.title.fontWeight = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="color">
                    <ColorPicker color={panel.styles.title.color} onChange={c => onChange((panel: Panel) => {
                        panel.styles.title.color = c
                    })} />
                </PanelEditItem>
                <PanelEditItem title="align">
                    <RadionButtons options={[{ label: "left", value: "left" }, { label: "center", value: "center" }]} value={panel.styles.title.align} onChange={v => onChange((panel: Panel) => {
                        panel.styles.title.align = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="padding top">
                    <EditorInputItem type="input" value={panel.styles.title?.paddingTop} onChange={v => onChange(panel => {
                        panel.styles.title.paddingTop = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="padding right">
                    <EditorInputItem type="input" value={panel.styles.title?.paddingRight} onChange={v => onChange(panel => {
                        panel.styles.title.paddingRight = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="padding bottom">
                    <EditorInputItem type="input" value={panel.styles.title?.paddingBottom} onChange={v => onChange(panel => {
                        panel.styles.title.paddingBottom = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="padding left">
                    <EditorInputItem type="input" value={panel.styles.title?.paddingLeft} onChange={v => onChange(panel => {
                        panel.styles.title.paddingLeft = v
                    })} />
                </PanelEditItem>
            </PanelAccordion>

            <PanelAccordion title={t1.panelDecoration}>
                <PanelEditItem title="type">
                    <DecorationSelect value={panel.styles?.decoration.type} onChange={v => {
                        onChange(panel => {
                            panel.styles.decoration.type = v
                        })
                    }} />
                    {/* <Select size="sm" value={panel.styles?.decoration.type} onChange={e => {
                        const v = e.currentTarget.value
                        onChange(panel => {
                            panel.styles.decoration.type = v
                        })
                    }}>
                        {
                            Object.keys(PanelDecorationType).map(key => <option value={PanelDecorationType[key]}>{key}</option>)
                        }
                    </Select> */}
                </PanelEditItem>
                <PanelEditItem title="reverse" desc={t1.reverseTips}>
                    <Switch defaultChecked={panel.styles.decoration.reverse} onChange={e => {
                        const checked = e.currentTarget.checked
                        onChange(panel => {
                            panel.styles.decoration.reverse = checked
                        })
                    }} />
                </PanelEditItem>
                <PanelEditItem title="width">
                    <EditorInputItem type="input" value={panel.styles.decoration.width} onChange={v => onChange(panel => {
                        panel.styles.decoration.width = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="height">
                    <EditorInputItem type="input" value={panel.styles.decoration.height} onChange={v => onChange(panel => {
                        panel.styles.decoration.height = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="top">
                    <EditorInputItem type="input" value={panel.styles.decoration.top} onChange={v => onChange(panel => {
                        panel.styles.decoration.top = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="left">
                    <EditorInputItem type="input" value={panel.styles.decoration.left} onChange={v => onChange(panel => {
                        panel.styles.decoration.left = v
                    })} />
                </PanelEditItem>
            </PanelAccordion>
        </>
    )
}

export default PanelStyles



