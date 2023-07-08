import { Box } from "@chakra-ui/react"
import { Trace } from "types/plugins/trace"
import TraceDetailHeader from "./TraceHeader"

interface Props {
    trace: Trace
}
const TraceDetail = ({trace}: Props) => {
    return (<Box maxHeight="100vh" overflowY="scroll">
        <TraceDetailHeader trace={trace}/>
    </Box>)
}

export default TraceDetail