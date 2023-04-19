import { Box, Switch, Text, VStack } from "@chakra-ui/react"
import { Dashboard } from "types/dashboard"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const GeneralSettings = ({dashboard,onChange}:Props) => {
    return (<>
        <VStack alignItems="left">
            <Box>
                <Text textStyle="subTitle">Shared tooltip</Text>
                <Text textStyle="annotation">Show tooltips at the same position across all panels</Text>
                <Switch isChecked={dashboard.data.sharedTooltip} onChange={e => {dashboard.data.sharedTooltip =  e.currentTarget.checked;onChange()}}/>
            </Box>
        </VStack>
    </>)
}

export default GeneralSettings