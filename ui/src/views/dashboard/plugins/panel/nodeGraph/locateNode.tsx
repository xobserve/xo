import { Graph } from "@antv/g6"
import { Box, Tooltip } from "@chakra-ui/react"
import { FaRegDotCircle, FaSearch, FaSistrix } from "react-icons/fa"

interface Props {
    graph: Graph
}
const LocateNode = ({ graph }: Props) => {
    return (<>
        <Tooltip label="locate the nodes you want"><Box color="currentcolor" cursor="pointer" ><FaRegDotCircle /></Box></Tooltip>
    </>)
}
export default LocateNode