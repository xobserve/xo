import { Box, HStack, Input, Switch, Text, useToast, VStack } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import { Form, FormItem } from "components/form/Form"
import { useEffect, useState } from "react"
import { Dashboard } from "types/dashboard"

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
    </Form>
    )
}

export default StyleSettings