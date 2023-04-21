import { Box, Input, Switch, Text, VStack } from "@chakra-ui/react"
import { useState } from "react"
import { Dashboard } from "types/dashboard"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const GeneralSettings = ({dashboard,onChange}:Props) => {
    const [title,setTitle] = useState(dashboard.title) 
    const [desc,setDesc] = useState(dashboard.data.description) 
    const [hidingVars, setHidingVars] = useState(dashboard.data.hidingVars)
    return (<>
        <VStack alignItems="left" spacing={3}>
            <Box>
                <Text textStyle="title">Title</Text>
                <Input value={title} onChange={e => setTitle(e.currentTarget.value)} onBlur={() => {dashboard.title=title; onChange()}} mt="1"/>
            </Box>
            <Box>
                <Text textStyle="title">Description</Text>
                <Input value={desc} onChange={e => setDesc(e.currentTarget.value)} onBlur={() => {dashboard.data.description=desc; onChange()}} mt="1"/>
            </Box>
            <Box>
                <Text textStyle="title">Editable</Text>
                <Text textStyle="annotation">Make this dashboard editable to anyone who has edit permissions. </Text>
                <Switch isChecked={dashboard.data.editable} onChange={e => {dashboard.data.editable =  e.currentTarget.checked;onChange()}} mt="1"/>
            </Box>
            <Box>
                <Text textStyle="title">Shared tooltip</Text>
                <Text textStyle="annotation">Show tooltips at the same position across all panels</Text>
                <Switch isChecked={dashboard.data.sharedTooltip} onChange={e => {dashboard.data.sharedTooltip =  e.currentTarget.checked;onChange()}} mt="1"/>
            </Box>

            <Box>
                <Text textStyle="title">Hide global variables</Text>
                <Input value={hidingVars} onChange={e => setHidingVars(e.currentTarget.value)} onBlur={() => {dashboard.data.hidingVars=hidingVars; onChange()}} mt="1" placeholder="enter global variables names, separated with ',' . e.g: app,env"/>
            </Box>
        </VStack>
    </>)
}

export default GeneralSettings