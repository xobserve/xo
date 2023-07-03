import { Box, HStack, Input, Select, Switch, Text, useToast, VStack } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import { Form } from "components/form/Form"
import { Dashboard } from "types/dashboard"
import BorderSelect from "components/largescreen/components/BorderSelect"
import FormItem from "components/form/Item"

interface Props {
    dashboard: Dashboard
    onChange: any
} 

const StyleSettings = ({ dashboard, onChange }: Props) => {
    return (<Form>
        <FormItem title="Background" desc="Background color or image of the dashboard" labelWidth="100%">
            <EditorInputItem value={dashboard.data.styles?.bg} onChange={(v) => onChange(draft => { draft.data.styles.bg = v })} />
        </FormItem>
        <FormItem title="Enable background" desc="Whether using the background image set above">
            <Switch defaultChecked={dashboard.data.styles?.bgEnabled} onChange={(e) => onChange(draft => { draft.data.styles.bgEnabled = e.currentTarget.checked })} />
        </FormItem>
        <FormItem title="Dashboard border" desc="Select a cool border for your dashboard">
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