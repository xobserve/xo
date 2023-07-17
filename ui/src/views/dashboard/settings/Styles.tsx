import {  Switch } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import { Form } from "components/form/Form"
import { Dashboard } from "types/dashboard"
import BorderSelect from "components/largescreen/components/BorderSelect"
import FormItem from "components/form/Item"
import React from "react";
import { useStore } from "@nanostores/react"
import { dashboardSettingMsg } from "src/i18n/locales/en"

interface Props {
    dashboard: Dashboard
    onChange: any
} 

const StyleSettings = ({ dashboard, onChange }: Props) => {
    const t1 = useStore(dashboardSettingMsg)
    return (<Form sx={{
        '.form-item-label': {
            width: '200px'
        }
    }}>
        <FormItem title={t1.background} desc={t1.backgroundTips} labelWidth="100%">
            <EditorInputItem value={dashboard.data.styles?.bg} onChange={(v) => onChange(draft => { draft.data.styles.bg = v })} />
        </FormItem>
        <FormItem title={t1.enableBg} desc={t1.enableBgTips}>
            <Switch defaultChecked={dashboard.data.styles?.bgEnabled} onChange={(e) => onChange(draft => { draft.data.styles.bgEnabled = e.currentTarget.checked })} />
        </FormItem>
        <FormItem title={t1.dashBorder} desc={t1.dashBorderTips}>
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