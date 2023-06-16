import { Box, HStack, Input, Select, Switch, Text, useToast, VStack } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import { Form, FormItem } from "components/form/Form"
import { useEffect, useState } from "react"
import { Dashboard } from "types/dashboard"
import { PanelBorderType } from "types/panel/styles"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const StyleSettings = ({ dashboard, onChange }: Props) => {
    useEffect(() => {
        if (!dashboard.data.tags) {
            dashboard.data.tags = []
        }
        if (!dashboard.data.styles) {
            dashboard.data.styles = {}
        }
    }, [])

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

    </Form>
    )
}

export default StyleSettings