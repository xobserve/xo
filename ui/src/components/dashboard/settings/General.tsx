import { Box, HStack, Input, Switch, Tag, TagCloseButton, TagLabel, Text, useToast, VStack } from "@chakra-ui/react"
import { cloneDeep } from "lodash"
import { useEffect, useState } from "react"
import { Dashboard } from "types/dashboard"

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
        dashboard.data.tags.push(tag)
        onChange()
        setTag('')
    }

    return (<>
        <VStack alignItems="left" spacing={3}>
            <Box>
                <Text textStyle="title">Title</Text>
                <Input value={title} onChange={e => setTitle(e.currentTarget.value)} onBlur={() => { dashboard.title = title; onChange() }} mt="1" />
            </Box>
            <Box>
                <Text textStyle="title">Description</Text>
                <Input value={desc} onChange={e => setDesc(e.currentTarget.value)} onBlur={() => { dashboard.data.description = desc; onChange() }} mt="1" />
            </Box>
            <Box>
                <Text textStyle="title">Editable</Text>
                <Text textStyle="annotation">Make this dashboard editable to anyone who has edit permissions. </Text>
                <Switch isChecked={dashboard.data.editable} onChange={e => { dashboard.data.editable = e.currentTarget.checked; onChange() }} mt="1" />
            </Box>
            <Box>
                <Text textStyle="title">Shared tooltip</Text>
                <Text textStyle="annotation">Show tooltips at the same position across all panels</Text>
                <Switch isChecked={dashboard.data.sharedTooltip} onChange={e => { dashboard.data.sharedTooltip = e.currentTarget.checked; onChange() }} mt="1" />
            </Box>

            <Box>
                <Text textStyle="title">Hide global variables</Text>
                <Input value={hidingVars} onChange={e => setHidingVars(e.currentTarget.value)} onBlur={() => { dashboard.data.hidingVars = hidingVars; onChange() }} mt="1" placeholder="enter global variables names, separated with ',' . e.g: app,env" />
            </Box>
            <Box>
                <Text textStyle="title">Tags</Text>
                <Text textStyle="annotation">Tag a dashboard and group it into a same collection for searching</Text>
                <HStack>
                    {
                        dashboard.data.tags?.map(t => <Tag>
                            <TagLabel>{t}</TagLabel>
                            <TagCloseButton onClick={() => {
                                dashboard.data.tags.splice(dashboard.data.tags.indexOf(t), 1)
                                onChange()
                            }} />
                        </Tag>)
                    }
                    <Input width="200px" size="sm" value={tag} onChange={e => setTag(e.currentTarget.value)} mt="1" placeholder="new tag(press enter to add)" onKeyPress={e => {
                        if (e.key === 'Enter') {
                           addTag()
                        }
                    }} />
                </HStack>
            </Box>
        </VStack>
    </>)
}

export default GeneralSettings