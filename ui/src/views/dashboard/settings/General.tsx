import { Box, HStack, Input, Select, Switch, Tag, TagCloseButton, TagLabel, Text, useToast, VStack } from "@chakra-ui/react"
import { Form } from "components/form/Form"
import FormItem from "components/form/Item"
import { useEffect, useState } from "react"
import { Dashboard, DashboardLayout } from "types/dashboard"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const GeneralSettings = ({ dashboard, onChange }: Props) => {
    const toast = useToast()
    useEffect(() => {
        if (!dashboard.data.tags) {
            dashboard.data.tags = []
        }
    },[])
    const [title, setTitle] = useState(dashboard.title)
    const [desc, setDesc] = useState(dashboard.data.description)
    const [hidingVars, setHidingVars] = useState(dashboard.data.hidingVars)
    const [tag, setTag] = useState('')

    const addTag = () => {
        if (dashboard.data.tags?.length >= 5) {
            toast({
                title: "You can only add up to 5 tags.",
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return 
        }

        if (dashboard.data.tags?.includes(tag)) {
            setTag('')
            return
        }
        onChange(draft => {draft.data.tags.push(tag)})
        setTag('')
    }

    return (<>
        <Form spacing={2} sx={{
            '.form-item-label': {
                width: '220px'
            }
        }}>
            <FormItem title="Title" >
                <Input size="sm" value={title} onChange={e => setTitle(e.currentTarget.value)} onBlur={() => onChange((draft:Dashboard)  => {draft.title = title}) } />
            </FormItem>
            <FormItem title="Description">
                <Input size="sm" value={desc} onChange={e => setDesc(e.currentTarget.value)} onBlur={() =>  onChange((draft:Dashboard)  => {draft.data.description = desc}) } mt="1" />
            </FormItem>
            {/* <Box>
                <Text textStyle="title">Editable</Text>
                <Text textStyle="annotation">Make this dashboard editable to anyone who has edit permissions. </Text>
                <Switch isChecked={dashboard.data.editable} onChange={e => { dashboard.data.editable = e.currentTarget.checked; onChange() }} mt="1" />
            </Box> */}
            <FormItem title="Shared tooltip" desc="Show tooltips at the same position across all panels" >
                <Switch isChecked={dashboard.data.sharedTooltip} onChange={e =>  onChange((draft:Dashboard)  => {draft.data.sharedTooltip =  e.currentTarget.checked}) }  />
            </FormItem>

            <FormItem title="Hide global variables">
                <Input size="sm" value={hidingVars} onChange={e => setHidingVars(e.currentTarget.value)} onBlur={() => onChange((draft:Dashboard)  => {draft.data.hidingVars = hidingVars})} mt="1" placeholder="enter global variables names, separated with ',' . e.g: app,env" />
            </FormItem>
            <FormItem title="Tags" desc="Tag a dashboard and group it into a same collection for searching" >
                <HStack>
                    {
                        dashboard.data.tags?.map(t => <Tag>
                            <TagLabel>{t}</TagLabel>
                            <TagCloseButton onClick={() => {
                                onChange((draft:Dashboard) => {draft.data.tags.splice(draft.data.tags.indexOf(t), 1)})
                            }} />
                        </Tag>)
                    }
                    <Input width="220px" size="sm" value={tag} onChange={e => setTag(e.currentTarget.value)} mt="1" placeholder="new tag(press enter to add)" onKeyPress={e => {
                        if (e.key === 'Enter') {
                           addTag()
                        }
                    }} />
                </HStack>
            </FormItem>

            <FormItem title="Panels layout" desc="Auto place panels in horizontal or vertical direction, when set to random, you can place panels anywhere" >
                <Select value={dashboard.data.layout} onChange={e => {
                    const v = e.currentTarget.value 
                    onChange((draft:Dashboard) => {draft.data.layout = v as DashboardLayout})
                }}>
                    {
                        Object.keys(DashboardLayout).map(k => <option value={[DashboardLayout[k]]}>{k}</option>)
                    }
                </Select>
            </FormItem>

            <FormItem title="Allow panels overlap" desc="panels can be placed overlap others">
                <Switch isChecked={dashboard.data.allowPanelsOverlap} onChange={e =>  onChange((draft:Dashboard) => {draft.data.allowPanelsOverlap =  e.currentTarget.checked}) } mt="1" />
            </FormItem>
        </Form>
    </>)
}

export default GeneralSettings