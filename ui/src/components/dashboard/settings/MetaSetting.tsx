import { Box, HStack, Input, Switch, Tag, TagCloseButton, TagLabel, Text, Textarea, useToast, VStack } from "@chakra-ui/react"
import { cloneDeep } from "lodash"
import { useEffect, useState } from "react"
import { Dashboard } from "types/dashboard"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const MetaSettings = ({ dashboard, onChange }: Props) => {
    return (<>
        <Textarea h="calc(100vh - 100px)" border="null">
            {JSON.stringify(dashboard,null,2)}
        </Textarea>
    </>)
}

export default MetaSettings