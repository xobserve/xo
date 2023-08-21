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
import { Select, Switch } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import { Form } from "components/form/Form"
import { Dashboard } from "types/dashboard"
import BorderSelect from "components/largescreen/components/BorderSelect"
import FormItem from "components/form/Item"
import React from "react";
import { useStore } from "@nanostores/react"
import { dashboardSettingMsg } from "src/i18n/locales/en"
import InputSelect from "components/select/InputSelect"
import { isEmpty } from "utils/validate"
import storage from "utils/localStorage"
import { PreviousColorModeKey } from "src/data/storage-keys"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const bgOptions = [
    {
        label: "Universe",
        value: "/public/dashboard/universe.png",
        colorMode: "dark",
    },
    {
        label: "Rainbow",
        value: "/public/dashboard/rainbow.jpg",
        colorMode: "light",
    },
]

const StyleSettings = ({ dashboard, onChange }: Props) => {
    const t1 = useStore(dashboardSettingMsg)
    return (<Form sx={{
        '.form-item-label': {
            width: '200px'
        }
    }} spacing={1}>
        <FormItem size="md" title={t1.background} desc={t1.backgroundTips} labelWidth="100%">
            {/* url(/public/dashboard-bg.png) */}
            <InputSelect
                width="500px"
                size="md"
                value={dashboard.data.styles.bg.url}
                onChange={(v) => {
                    onChange(draft => {
                        draft.data.styles.bg = {
                            url: v.trim(),
                            colorMode: bgOptions.find(item => item.value === v.trim())?.colorMode ?? "dark",
                        }
                    })
                    storage.remove(PreviousColorModeKey)
                }}
                options={bgOptions as any} 
            />
        </FormItem>
        <FormItem title={t1.backgroundColorMode}>
            <Select value={dashboard.data.styles.bg.colorMode} onChange={
                (e) => {
                    const v = e.currentTarget.value
                    onChange(draft => { draft.data.styles.bg.colorMode = v })
                    storage.remove(PreviousColorModeKey)
                }
            } isDisabled={!isEmpty(bgOptions.find(item => item.value === dashboard.data.styles.bg.url))}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </Select>
        </FormItem>
        <FormItem title={t1.enableBg} desc={t1.enableBgTips} alignItems="center">
            <Switch defaultChecked={dashboard.data.styles?.bgEnabled} onChange={(e) => onChange(draft => { draft.data.styles.bgEnabled = e.currentTarget.checked })} />
        </FormItem>
        <FormItem title={t1.dashBorder} desc={t1.dashBorderTips} alignItems="center">
            <BorderSelect value={dashboard.data.styles?.border} onChange={v => {
                onChange(draft => {
                    draft.data.styles.border = v
                })
            }} />
        </FormItem>

        {/* <PanelAccordion title="Decoration" defaultOpen>
                <PanelEditItem title="type">
                    <Select size="sm" value={dashboard.data.styles?.decoration.type} onChange={e => {
                        const v = e.currentTarget.value
                        onChange(dashboard => {
                            dashboard.data.styles.decoration.type = v
                        })
                    }}>
                        {
                            Object.keys(PanelDecorationType).map(key => <option value={PanelDecorationType[key]}>{key}</option>)
                        }
                    </Select>
                </PanelEditItem>
                <PanelEditItem title="reverse" desc="only a few decorations support reverse mode">
                    <Switch defaultChecked={dashboard.data.styles.decoration.reverse} onChange={e => {
                        const checked = e.currentTarget.checked
                        onChange(dashboard => {
                            dashboard.data.styles.decoration.reverse = checked
                        })
                    }}/>
                </PanelEditItem>
                <PanelEditItem title="width">
                    <EditorInputItem type="input" value={dashboard.data.styles.decoration.width} onChange={v => onChange(dashboard => {
                        dashboard.data.styles.decoration.width = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="height">
                    <EditorInputItem type="input" value={dashboard.data.styles.decoration.height} onChange={v => onChange(dashboard => {
                        dashboard.data.styles.decoration.height = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="top">
                    <EditorInputItem type="input" value={dashboard.data.styles.decoration.top} onChange={v => onChange(dashboard => {
                        dashboard.data.styles.decoration.top = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="left">
                    <EditorInputItem type="input" value={dashboard.data.styles.decoration.left} onChange={v => onChange(dashboard => {
                        dashboard.data.styles.decoration.left = v
                    })} />
                </PanelEditItem>
            </PanelAccordion> */}

    </Form>
    )
}

export default StyleSettings