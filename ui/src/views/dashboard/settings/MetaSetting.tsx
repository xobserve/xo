import { Textarea } from "@chakra-ui/react"
import { Dashboard } from "types/dashboard"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const MetaSettings = ({ dashboard }: Props) => {
    return (<>
        <Textarea h="calc(100vh - 100px)" border="null">
            {JSON.stringify(dashboard,null,2)}
        </Textarea>
    </>)
}

export default MetaSettings