import { Box } from "@chakra-ui/react"
import { FaChevronRight } from "react-icons/fa"

const CollapseIcon = ({ collapsed, onClick }) => {
    return (
        <Box cursor="pointer" onClick={onClick} transition={"transform 0.15s ease-out;"} transform={collapsed ? 'rotate(0deg);' : 'rotate(90deg);'}>
            <FaChevronRight />
        </Box>
    )
}

export default CollapseIcon