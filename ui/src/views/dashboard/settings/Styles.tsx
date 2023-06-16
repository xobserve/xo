import { Box, HStack, Input, Select, Switch, Text, useToast, VStack } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import { Form, FormItem } from "components/form/Form"
import { useEffect, useState } from "react"
import { Dashboard } from "types/dashboard"
import { PanelBorderType, PanelDecorationType } from "types/panel/styles"
import PanelAccordion from "../edit-panel/Accordion"
import PanelEditItem from "../edit-panel/PanelEditItem"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const StyleSettings = ({ dashboard, onChange }: Props) => {
    return (<Form size="sm">
        <FormItem title="Background" desc="Background color or image of the dashboard">
            <EditorInputItem value={dashboard.data.styles?.bg} onChange={(v) => onChange(draft => { draft.data.styles.bg = v })} />
        </FormItem>
        <FormItem title="Enable background" desc="Whether using the background image set above">
            <Switch defaultChecked={dashboard.data.styles?.bgEnabled} onChange={(e) => onChange(draft => { draft.data.styles.bgEnabled = e.currentTarget.checked })} />
        </FormItem>
        <FormItem title="Enable background" desc="Whether using the background image set above">
            <Select size="sm" value={dashboard.data.styles?.border} onChange={e => {
                const v = e.currentTarget.value
                onChange(draft => { 
                    draft.data.styles.border = v
                })
            }}>
                {
                    Object.keys(PanelBorderType).map(key => key != PanelBorderType.Normal && <option value={PanelBorderType[key]}>{key}</option>)
                }
            </Select>
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