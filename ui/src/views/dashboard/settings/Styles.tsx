import { Box, HStack, Input, Switch, Tag, TagCloseButton, TagLabel, Text, useToast, VStack } from "@chakra-ui/react"
import { cloneDeep } from "lodash"
import { useEffect, useState } from "react"
import { Dashboard } from "types/dashboard"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const StyleSettings = ({ dashboard, onChange }: Props) => {
    const toast = useToast()
    useEffect(() => {
        if (!dashboard.data.tags) {
            dashboard.data.tags = []
        }
        if (!dashboard.data.styles) {
            dashboard.data.styles = {}
        }
    },[])

    const [bg, setBg] = useState(dashboard.data.styles?.bg)

    return (<>
        <VStack alignItems="left" spacing={4}>
            <Box>
                <Text textStyle="title">Background</Text>
                <Input value={bg} onChange={e => setBg(e.currentTarget.value)} onBlur={() => onChange(draft => {draft.data.styles.bg = bg}) } mt="1" />
            </Box>
        </VStack>
    </>)
}

export default StyleSettings